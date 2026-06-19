import { describe, expect, it, vi } from 'vitest';
import { createImportService } from '../services/retail/src/services/import.service';

function createDeps() {
  const importRepository = {
    createImportJob: vi.fn(async (input) => ({ id: 'job-id', ...(input as object) })),
    updateImportJob: vi.fn(async (_id, input) => ({ id: 'job-id', ...(input as object) })),
    getImportJobById: vi.fn(async () => ({ id: 'job-id', status: 'completed' })),
    createImportErrors: vi.fn(async () => undefined),
    listImportErrors: vi.fn(async () => ({ items: [], total: 0, page: 1, limit: 20 })),
    findProductIdByShopProductUrl: vi.fn(async () => null),
  };
  const productRepository = {
    findProductBySourceProductId: vi.fn(async () => null),
  };
  const productService = {
    createProduct: vi.fn(async () => ({ product: { id: 1 } })),
    updateProduct: vi.fn(async () => ({ product: { id: 1 } })),
  };
  const brandRepository = {
    findBrandBySlug: vi.fn(async () => null),
  };
  const shopRepository = {
    findShopByShopKey: vi.fn(async () => null),
  };

  return { importRepository, productRepository, productService, brandRepository, shopRepository };
}

const payload = {
  source_type: 'json' as const,
  mapping: {
    name: 'title',
    source_product_id: 'external_id',
    shop_id: 'shop',
    current_price: 'price',
    shop_product_url: 'url',
  },
  rows: [
    {
      title: 'Phone',
      external_id: 'ext-1',
      shop: 2,
      price: 999,
      url: 'https://shop.tn/p',
    },
  ],
};

describe('catalog import service', () => {
  it('previews rows without writing products', async () => {
    const deps = createDeps();
    const service = createImportService(deps as never);

    const result = await service.previewImport(payload);

    expect(result.summary).toMatchObject({ total_rows: 1, valid_rows: 1, failed_count: 0 });
    expect(deps.importRepository.createImportJob).toHaveBeenCalledWith(
      expect.objectContaining({ source_type: 'json', status: 'previewed', total_rows: 1, valid_rows: 1 }),
    );
    expect(deps.productService.createProduct).not.toHaveBeenCalled();
    expect(deps.productService.updateProduct).not.toHaveBeenCalled();
  });

  it('creates products when no existing source product or shop URL match exists', async () => {
    const deps = createDeps();
    const service = createImportService(deps as never);

    const result = await service.runImport(payload);

    expect(result.summary).toMatchObject({ created_count: 1, updated_count: 0, failed_count: 0 });
    expect(deps.productService.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Phone',
        source_product_id: 'ext-1',
        shop_prices: [expect.objectContaining({ shop_id: 2, current_price: 999 })],
      }),
    );
  });

  it('updates products when source_product_id matches first', async () => {
    const deps = createDeps();
    deps.productRepository.findProductBySourceProductId.mockResolvedValueOnce({ id: 44 });
    const service = createImportService(deps as never);

    const result = await service.runImport(payload);

    expect(result.summary).toMatchObject({ created_count: 0, updated_count: 1, failed_count: 0 });
    expect(deps.productService.updateProduct).toHaveBeenCalledWith(
      44,
      expect.objectContaining({ name: 'Phone', source_product_id: 'ext-1' }),
    );
    expect(deps.importRepository.findProductIdByShopProductUrl).not.toHaveBeenCalled();
  });

  it('updates products when shop_product_url matches second', async () => {
    const deps = createDeps();
    deps.importRepository.findProductIdByShopProductUrl.mockResolvedValueOnce(55);
    const service = createImportService(deps as never);

    await service.runImport(payload);

    expect(deps.productService.updateProduct).toHaveBeenCalledWith(55, expect.any(Object));
  });

  it('records row errors and completes with errors when some rows fail', async () => {
    const deps = createDeps();
    const service = createImportService(deps as never);

    const result = await service.runImport({
      ...payload,
      rows: [...payload.rows, { title: '', external_id: 'bad' }],
    });

    expect(result.summary).toMatchObject({ total_rows: 2, valid_rows: 1, failed_count: 1 });
    expect(deps.importRepository.createImportErrors).toHaveBeenCalledWith(
      'job-id',
      [expect.objectContaining({ row_number: 2, error_code: 'ROW_INVALID' })],
    );
    expect(deps.importRepository.updateImportJob).toHaveBeenCalledWith(
      'job-id',
      expect.objectContaining({ status: 'completed_with_errors' }),
    );
  });
});
