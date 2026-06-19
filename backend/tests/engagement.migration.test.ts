import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('engagement migration', () => {
  it('creates minimal favorites and alerts tables with uniqueness and checks', async () => {
    const source = await readFile(
      path.join(process.cwd(), 'shared', 'db', 'migrations', '005_engagement_minimal.js'),
      'utf8',
    );

    expect(source).toContain('CREATE TABLE IF NOT EXISTS favorites');
    expect(source).toContain('CREATE TABLE IF NOT EXISTS alerts');
    expect(source).toContain('UNIQUE(user_id, catalog_domain, product_id)');
    expect(source).toContain('UNIQUE(user_id, catalog_domain, product_id, alert_type)');
    expect(source).toContain("catalog_domain IN ('retail', 'para', 'alimentation', 'fashion')");
    expect(source).toContain("alert_type IN ('price_drop', 'price_below', 'back_in_stock', 'promotion')");
    expect(source).not.toMatch(/shop_id|target_price|threshold|delivery_status|last_triggered/i);
  });
});
