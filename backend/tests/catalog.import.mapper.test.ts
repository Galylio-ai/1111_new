import { describe, expect, it } from 'vitest';
import { parseCsvRows } from '../services/retail/src/utils/csvParser';
import { mapImportRow } from '../services/retail/src/utils/importMapper';

describe('catalog import parser and mapper', () => {
  it('parses CSV rows into plain objects', () => {
    const rows = parseCsvRows('title,price,url\nPhone,999,https://shop.tn/p');

    expect(rows).toEqual([{ title: 'Phone', price: '999', url: 'https://shop.tn/p' }]);
  });

  it('maps a source row into a full product import payload', () => {
    const mapped = mapImportRow(
      {
        title: 'iPhone 15',
        external_id: 'ext-1',
        brand_id: '4',
        subcats: '10,11',
        images: 'https://example.com/a.jpg,https://example.com/b.jpg',
        attributes: { storage: '128GB', color: 'Black' },
        shop: '2',
        price: '3299',
        old_price: '3499',
        url: 'https://shop.tn/iphone-15',
      },
      {
        name: 'title',
        source_product_id: 'external_id',
        brand_id: 'brand_id',
        subcategory_ids: 'subcats',
        image_urls: 'images',
        specs: 'attributes',
        shop_id: 'shop',
        current_price: 'price',
        regular_price: 'old_price',
        shop_product_url: 'url',
      },
      '2026-06-17T10:00:00.000Z',
    );

    expect(mapped).toMatchObject({
      name: 'iPhone 15',
      source_product_id: 'ext-1',
      brand_id: 4,
      subcategory_ids: [10, 11],
      images: [
        { image_url: 'https://example.com/a.jpg' },
        { image_url: 'https://example.com/b.jpg' },
      ],
      specs: [
        { spec_key: 'storage', spec_value: '128GB' },
        { spec_key: 'color', spec_value: 'Black' },
      ],
      shop_prices: [
        {
          shop_id: 2,
          current_price: 3299,
          regular_price: 3499,
          shop_product_url: 'https://shop.tn/iphone-15',
          recorded_at: '2026-06-17T10:00:00.000Z',
        },
      ],
    });
  });

  it('returns row-level errors for missing required mapped fields', () => {
    expect(() => mapImportRow({}, { name: 'title' }, '2026-06-17T10:00:00.000Z')).toThrow(
      'Product name is required',
    );
  });
});
