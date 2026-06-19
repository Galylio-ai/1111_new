import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';

const domains = ['retail', 'para', 'alimentation', 'fashion'] as const;

describe('catalog reporting indexes', () => {
  it.each(domains)('%s has append-only reporting indexes for dashboard queries', async (domain) => {
    const migration = await readFile(
      path.join(
        process.cwd(),
        'services',
        domain,
        'src',
        'db',
        'migrations',
        '002_reporting_indexes.js',
      ),
      'utf8',
    );

    expect(migration).toContain('idx_products_source_product_id');
    expect(migration).toContain('idx_products_name_lower');
    expect(migration).toContain('idx_shop_prices_shop_updated_at');
    expect(migration).toContain('idx_product_specs_key_value');
    expect(migration).toContain('idx_price_history_shop_recorded_at');
    expect(migration).not.toMatch(/DROP TABLE|ALTER TABLE .* DROP/i);
  });
});
