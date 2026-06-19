import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { ADMIN_ONLY_PATH_PREFIXES } from '../gateway/src/config/routes';

describe('gateway admin integration routes', () => {
  it('protects admin catalog and web-control routes from normal users', () => {
    expect(ADMIN_ONLY_PATH_PREFIXES).toContain('/api/admin/catalog');
    expect(ADMIN_ONLY_PATH_PREFIXES).toContain('/api/admin/web-control');
  });

  it('documents catalog and web-control service URLs', async () => {
    const envExample = await readFile(path.join(process.cwd(), '.env.example'), 'utf8');
    const gatewayConfig = await readFile(path.join(process.cwd(), 'gateway', 'src', 'config', 'index.ts'), 'utf8');

    for (const expected of [
      'RETAIL_SERVICE_URL=http://retail:3003',
      'PARA_SERVICE_URL=http://para:3004',
      'ALIMENTATION_SERVICE_URL=http://alimentation:3005',
      'FASHION_SERVICE_URL=http://fashion:3007',
      'WEB_CONTROL_SERVICE_URL=http://web-control:3009',
      'WEB_CONTROL_PORT=3009',
    ]) {
      expect(envExample).toContain(expected);
    }

    for (const expected of [
      'retailServiceUrl',
      'paraServiceUrl',
      'alimentationServiceUrl',
      'fashionServiceUrl',
      'webControlServiceUrl',
    ]) {
      expect(gatewayConfig).toContain(expected);
    }
  });

  it('proxies each catalog domain and web-control through admin paths', async () => {
    const gatewayIndex = await readFile(path.join(process.cwd(), 'gateway', 'src', 'index.ts'), 'utf8');

    for (const expected of [
      "'/api/admin/catalog/retail'",
      "'/api/admin/catalog/para'",
      "'/api/admin/catalog/alimentation'",
      "'/api/admin/catalog/fashion'",
      "'/api/admin/web-control'",
    ]) {
      expect(gatewayIndex).toContain(expected);
    }

    expect(gatewayIndex).toContain('config.retailServiceUrl');
    expect(gatewayIndex).toContain('config.paraServiceUrl');
    expect(gatewayIndex).toContain('config.alimentationServiceUrl');
    expect(gatewayIndex).toContain('config.fashionServiceUrl');
    expect(gatewayIndex).toContain('config.webControlServiceUrl');
    expect(gatewayIndex).toContain("pathRewrite: (path) => path");
    expect(gatewayIndex).toContain("pathRewrite: (path) => `/web-control${path}`");
  });
});
