import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('catalog advanced repository query shapes', () => {
  it('keeps product insight queries grounded in joins/window functions/date buckets', async () => {
    const source = await readFile(
      path.join(process.cwd(), 'services', 'retail', 'src', 'repositories', 'product.repository.ts'),
      'utf8',
    );

    expect(source).toContain('ROW_NUMBER() OVER');
    expect(source).toContain('date_trunc');
    expect(source).toContain('LEFT JOIN product_images');
    expect(source).toContain('LEFT JOIN product_specs');
    expect(source).toContain('HAVING COUNT(*) > 1');
    expect(source).toContain('regular_price > current_price');
    expect(source).toContain('shop_count');
  });

  it('keeps shop/brand/category analytics query functions in repositories only', async () => {
    const [shop, brand, category] = await Promise.all([
      readFile(path.join(process.cwd(), 'services', 'retail', 'src', 'repositories', 'shop.repository.ts'), 'utf8'),
      readFile(path.join(process.cwd(), 'services', 'retail', 'src', 'repositories', 'brand.repository.ts'), 'utf8'),
      readFile(path.join(process.cwd(), 'services', 'retail', 'src', 'repositories', 'category.repository.ts'), 'utf8'),
    ]);

    expect(shop).toContain('getShopInsights');
    expect(shop).toContain('COUNT(DISTINCT p.id)');
    expect(brand).toContain('getBrandAnalytics');
    expect(brand).toContain('AVG(sp.current_price)');
    expect(category).toContain('getCategoryAnalytics');
    expect(category).toContain('top_category_id');
  });
});
