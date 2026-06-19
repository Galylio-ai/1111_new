import { MappedImportProduct } from '../entities/import.entities';

type SourceRow = Record<string, unknown>;
type Mapping = Record<string, string>;

function valueFor(row: SourceRow, mapping: Mapping, target: string): unknown {
  const sourceKey = mapping[target] ?? target;
  return row[sourceKey];
}

function optionalString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function nullableString(value: unknown): string | null | undefined {
  const text = optionalString(value);
  return text === undefined ? undefined : text;
}

function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`Invalid number value: ${String(value)}`);
  return number;
}

function nullablePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`Invalid price value: ${String(value)}`);
  return number;
}

function parseArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    }
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [value];
}

function parseNumberArray(value: unknown): number[] {
  return parseArray(value).map((item) => {
    const number = Number(item);
    if (!Number.isInteger(number) || number <= 0) {
      throw new Error(`Invalid id value: ${String(item)}`);
    }
    return number;
  });
}

function parseSpecs(value: unknown) {
  if (value === null || value === undefined || value === '') return [];
  const parsed = typeof value === 'string' && value.trim().startsWith('{') ? JSON.parse(value) : value;

  if (Array.isArray(parsed)) {
    return parsed
      .map((spec) => ({
        spec_key: optionalString((spec as Record<string, unknown>).spec_key),
        spec_value: optionalString((spec as Record<string, unknown>).spec_value),
      }))
      .filter((spec): spec is { spec_key: string; spec_value: string } => Boolean(spec.spec_key && spec.spec_value));
  }

  if (typeof parsed === 'object' && parsed !== null) {
    return Object.entries(parsed).map(([spec_key, spec_value]) => ({
      spec_key,
      spec_value: String(spec_value),
    }));
  }

  return [];
}

export function mapImportRow(
  row: SourceRow,
  mapping: Mapping,
  defaultRecordedAt: string,
): MappedImportProduct {
  const name = optionalString(valueFor(row, mapping, 'name'));
  if (!name) throw new Error('Product name is required');

  const imageUrls = parseArray(valueFor(row, mapping, 'image_urls'))
    .map(optionalString)
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));

  const shopId = optionalNumber(valueFor(row, mapping, 'shop_id'));
  const shopKey = optionalString(valueFor(row, mapping, 'shop_key'));
  const shopProductUrl = optionalString(valueFor(row, mapping, 'shop_product_url'));
  const hasShopPrice =
    shopProductUrl ||
    shopId ||
    shopKey ||
    valueFor(row, mapping, 'current_price') !== undefined ||
    valueFor(row, mapping, 'regular_price') !== undefined;

  if (hasShopPrice && !shopProductUrl) throw new Error('shop_product_url is required for shop prices');
  if (hasShopPrice && !shopId && !shopKey) throw new Error('shop_id or shop_key is required for shop prices');

  return {
    name,
    slug: optionalString(valueFor(row, mapping, 'slug')),
    brand_id: optionalNumber(valueFor(row, mapping, 'brand_id')),
    brand_name: optionalString(valueFor(row, mapping, 'brand_name')),
    description: nullableString(valueFor(row, mapping, 'description')),
    source_product_id: nullableString(valueFor(row, mapping, 'source_product_id')),
    source_url: nullableString(valueFor(row, mapping, 'source_url')),
    status: optionalString(valueFor(row, mapping, 'status')) as MappedImportProduct['status'],
    subcategory_ids: parseNumberArray(valueFor(row, mapping, 'subcategory_ids')),
    images: imageUrls.map((image_url) => ({ image_url })),
    specs: parseSpecs(valueFor(row, mapping, 'specs')),
    shop_prices: hasShopPrice
      ? [
          {
            shop_id: shopId,
            shop_key: shopKey,
            current_price: nullablePrice(valueFor(row, mapping, 'current_price')),
            regular_price: nullablePrice(valueFor(row, mapping, 'regular_price')),
            shop_product_url: shopProductUrl as string,
            recorded_at: optionalString(valueFor(row, mapping, 'recorded_at')) ?? defaultRecordedAt,
          },
        ]
      : [],
    force_price_history: Boolean(valueFor(row, mapping, 'force_price_history')),
  };
}
