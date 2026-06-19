import * as importRepositoryDefault from '../repositories/import.repository';
import * as productRepositoryDefault from '../repositories/product.repository';
import * as productServiceDefault from './product.service';
import * as brandRepositoryDefault from '../repositories/brand.repository';
import * as shopRepositoryDefault from '../repositories/shop.repository';
import { AppError } from '../middleware/errorHandler';
import { ImportErrorRecord, ImportPayload, MappedImportProduct } from '../entities/import.entities';
import { parseCsvRows } from '../utils/csvParser';
import { mapImportRow } from '../utils/importMapper';
import { slugify } from '../utils/slug';

type ImportRepository = typeof importRepositoryDefault;
type ProductRepository = Pick<typeof productRepositoryDefault, 'findProductBySourceProductId'>;
type ProductService = Pick<typeof productServiceDefault, 'createProduct' | 'updateProduct'>;
type BrandRepository = Pick<typeof brandRepositoryDefault, 'findBrandBySlug'>;
type ShopRepository = Pick<typeof shopRepositoryDefault, 'findShopByShopKey'>;

function rowsFromPayload(payload: ImportPayload): Array<Record<string, unknown>> {
  return payload.source_type === 'csv' ? parseCsvRows(payload.csv ?? '') : payload.rows ?? [];
}

function errorFor(row: Record<string, unknown>, rowNumber: number, err: unknown): ImportErrorRecord {
  return {
    row_number: rowNumber,
    source_row: row,
    error_code: 'ROW_INVALID',
    error_message: err instanceof Error ? err.message : 'Invalid row',
  };
}

function cleanProductPayload(input: MappedImportProduct) {
  const shopPrices = input.shop_prices.map((shopPrice) => {
    if (!shopPrice.shop_id) throw new Error('shop_id or shop_key is required for shop prices');
    return {
      shop_id: shopPrice.shop_id,
      current_price: shopPrice.current_price,
      regular_price: shopPrice.regular_price,
      shop_product_url: shopPrice.shop_product_url,
      recorded_at: shopPrice.recorded_at,
    };
  });

  return {
    name: input.name,
    slug: input.slug,
    brand_id: input.brand_id ?? null,
    description: input.description,
    source_product_id: input.source_product_id,
    source_url: input.source_url,
    status: input.status,
    subcategory_ids: input.subcategory_ids,
    images: input.images,
    specs: input.specs,
    shop_prices: shopPrices,
    force_price_history: input.force_price_history,
  };
}

export function createImportService(
  deps: {
    importRepository?: ImportRepository;
    productRepository?: ProductRepository;
    productService?: ProductService;
    brandRepository?: BrandRepository;
    shopRepository?: ShopRepository;
  } = {},
) {
  const importRepository = deps.importRepository ?? importRepositoryDefault;
  const productRepository = deps.productRepository ?? productRepositoryDefault;
  const productService = deps.productService ?? productServiceDefault;
  const brandRepository = deps.brandRepository ?? brandRepositoryDefault;
  const shopRepository = deps.shopRepository ?? shopRepositoryDefault;

  async function resolveReferences(input: MappedImportProduct): Promise<MappedImportProduct> {
    const resolved = { ...input, shop_prices: input.shop_prices.map((shopPrice) => ({ ...shopPrice })) };

    if (!resolved.brand_id && resolved.brand_name) {
      const brand = await brandRepository.findBrandBySlug(slugify(resolved.brand_name));
      if (!brand) throw new Error(`Brand not found: ${resolved.brand_name}`);
      resolved.brand_id = Number(brand.id);
    }

    for (const shopPrice of resolved.shop_prices) {
      if (!shopPrice.shop_id && shopPrice.shop_key) {
        const shop = await shopRepository.findShopByShopKey(shopPrice.shop_key);
        if (!shop) throw new Error(`Shop not found: ${shopPrice.shop_key}`);
        shopPrice.shop_id = Number(shop.id);
      }
      if (!shopPrice.shop_id) throw new Error('shop_id or shop_key is required for shop prices');
    }

    return resolved;
  }

  async function findExistingProductId(input: MappedImportProduct): Promise<number | null> {
    if (input.source_product_id) {
      const product = await productRepository.findProductBySourceProductId(input.source_product_id);
      if (product?.id) return Number(product.id);
    }
    const shopProductUrl = input.shop_prices[0]?.shop_product_url;
    if (shopProductUrl) return importRepository.findProductIdByShopProductUrl(shopProductUrl);
    return null;
  }

  function mapRows(payload: ImportPayload) {
    const recordedAt = new Date().toISOString();
    const rows = rowsFromPayload(payload);
    const mappedRows: Array<{ row_number: number; source_row: Record<string, unknown>; mapped: MappedImportProduct }> = [];
    const errors: ImportErrorRecord[] = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 1;
      try {
        mappedRows.push({
          row_number: rowNumber,
          source_row: row,
          mapped: mapImportRow(row, payload.mapping, recordedAt),
        });
      } catch (err) {
        errors.push(errorFor(row, rowNumber, err));
      }
    });

    return { rows, mappedRows, errors };
  }

  async function previewImport(payload: ImportPayload) {
    const { rows, mappedRows, errors } = mapRows(payload);
    const summary = {
      total_rows: rows.length,
      valid_rows: mappedRows.length,
      created_count: 0,
      updated_count: 0,
      failed_count: errors.length,
      archived_count: 0,
    };
    const job = await importRepository.createImportJob({
      source_type: payload.source_type,
      status: 'previewed',
      ...summary,
      mapping: payload.mapping,
      summary,
    });
    await importRepository.createImportErrors(job.id, errors);
    return { job, summary, sample: mappedRows.slice(0, 10).map((row) => row.mapped), errors };
  }

  async function runImport(payload: ImportPayload) {
    const { rows, mappedRows, errors } = mapRows(payload);
    const job = await importRepository.createImportJob({
      source_type: payload.source_type,
      status: 'running',
      total_rows: rows.length,
      valid_rows: 0,
      created_count: 0,
      updated_count: 0,
      failed_count: errors.length,
      archived_count: 0,
      mapping: payload.mapping,
      summary: {},
    });

    let createdCount = 0;
    let updatedCount = 0;
    let validRows = 0;
    const runErrors = [...errors];

    for (const row of mappedRows) {
      try {
        const resolved = await resolveReferences(row.mapped);
        const existingProductId = await findExistingProductId(resolved);
        const productPayload = cleanProductPayload(resolved);
        if (existingProductId) {
          await productService.updateProduct(existingProductId, productPayload);
          updatedCount += 1;
        } else {
          await productService.createProduct(productPayload);
          createdCount += 1;
        }
        validRows += 1;
      } catch (err) {
        runErrors.push(errorFor(row.source_row, row.row_number, err));
      }
    }

    await importRepository.createImportErrors(job.id, runErrors);
    const summary = {
      total_rows: rows.length,
      valid_rows: validRows,
      created_count: createdCount,
      updated_count: updatedCount,
      failed_count: runErrors.length,
      archived_count: 0,
    };
    const updatedJob = await importRepository.updateImportJob(job.id, {
      status: runErrors.length > 0 ? 'completed_with_errors' : 'completed',
      ...summary,
      summary,
      finished_at: new Date(),
    });

    return { job: updatedJob ?? job, summary, errors: runErrors };
  }

  async function getImportJobById(id: string) {
    const job = await importRepository.getImportJobById(id);
    if (!job) throw new AppError(404, 'Import job not found');
    return job;
  }

  return {
    previewImport,
    runImport,
    getImportJobById,
    listImportErrors: importRepository.listImportErrors,
  };
}

const service = createImportService();

export const previewImport = service.previewImport;
export const runImport = service.runImport;
export const getImportJobById = service.getImportJobById;
export const listImportErrors = service.listImportErrors;
