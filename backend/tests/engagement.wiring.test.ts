import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { ADMIN_ONLY_PATH_PREFIXES } from '../gateway/src/config/routes';

describe('engagement wiring', () => {
  it('registers the engagement workspace and dev script', async () => {
    const rootPackage = JSON.parse(await readFile(path.join(process.cwd(), 'package.json'), 'utf8'));

    expect(rootPackage.workspaces).toContain('services/engagement');
    expect(rootPackage.scripts['dev:engagement']).toBe('cd services/engagement && npm run dev');
  });

  it('documents the engagement service URL and port', async () => {
    const envExample = await readFile(path.join(process.cwd(), '.env.example'), 'utf8');

    expect(envExample).toContain('ENGAGEMENT_SERVICE_URL=http://engagement:3008');
    expect(envExample).toContain('ENGAGEMENT_PORT=3008');
  });

  it('proxies engagement through the gateway without making it admin-only', async () => {
    const gatewayConfig = await readFile(path.join(process.cwd(), 'gateway', 'src', 'config', 'index.ts'), 'utf8');
    const gatewayIndex = await readFile(path.join(process.cwd(), 'gateway', 'src', 'index.ts'), 'utf8');

    expect(gatewayConfig).toContain('engagementServiceUrl');
    expect(gatewayIndex).toContain("'/api/engagement'");
    expect(gatewayIndex).toContain('config.engagementServiceUrl');
    expect(gatewayIndex).toContain("pathRewrite: (path) => `/engagement${path}`");
    expect(ADMIN_ONLY_PATH_PREFIXES).not.toContain('/api/engagement');
  });

  it('adds engagement to Docker Compose and Node package-copy lists', async () => {
    const compose = await readFile(path.join(process.cwd(), 'docker-compose.yml'), 'utf8');
    const dockerfiles = [
      'gateway/Dockerfile',
      'services/auth/Dockerfile',
      'services/user/Dockerfile',
      'services/retail/Dockerfile',
      'services/para/Dockerfile',
      'services/alimentation/Dockerfile',
      'services/fashion/Dockerfile',
      'services/mailer-api/Dockerfile',
      'services/engagement/Dockerfile',
    ];

    expect(compose).toContain('engagement:');
    expect(compose).toContain('dockerfile: services/engagement/Dockerfile');
    expect(compose).toContain('http://localhost:3008/health');

    for (const dockerfile of dockerfiles) {
      const source = await readFile(path.join(process.cwd(), dockerfile), 'utf8');
      expect(source, `${dockerfile} should copy engagement package.json`).toContain(
        'COPY services/engagement/package.json ./services/engagement/package.json',
      );
    }
  });
});
