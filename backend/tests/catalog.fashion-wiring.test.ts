import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('fashion catalog service wiring', () => {
  it('is registered as an npm workspace with a dev script', async () => {
    const rootPackage = JSON.parse(
      await readFile(path.join(process.cwd(), 'package.json'), 'utf8'),
    );

    expect(rootPackage.workspaces).toContain('services/fashion');
    expect(rootPackage.scripts['dev:fashion']).toBe('cd services/fashion && npm run dev');
  });

  it('uses the fashion package name and service config defaults', async () => {
    const servicePackage = JSON.parse(
      await readFile(path.join(process.cwd(), 'services', 'fashion', 'package.json'), 'utf8'),
    );
    const configSource = await readFile(
      path.join(process.cwd(), 'services', 'fashion', 'src', 'config.ts'),
      'utf8',
    );

    expect(servicePackage.name).toBe('@app/fashion');
    expect(configSource).toContain("const dbPrefix = 'FASHION'");
    expect(configSource).toContain("serviceName: 'fashion'");
    expect(configSource).toContain("process.env.FASHION_PORT ?? '3007'");
    expect(configSource).toContain("env('DB_NAME', 'fashion_db')");
  });

  it('documents fashion env variables and Docker Compose services', async () => {
    const envExample = await readFile(path.join(process.cwd(), '.env.example'), 'utf8');
    const compose = await readFile(path.join(process.cwd(), 'docker-compose.yml'), 'utf8');

    expect(envExample).toContain('FASHION_DB_HOST=fashion-postgres');
    expect(envExample).toContain('FASHION_DB_NAME=fashion_db');
    expect(envExample).toContain('FASHION_DB_USER=fashion_user');
    expect(envExample).toContain('FASHION_PORT=3007');

    expect(compose).toContain('fashion-postgres:');
    expect(compose).toContain('fashion:');
    expect(compose).toContain('fashion_postgres_data:');
    expect(compose).toContain('http://localhost:3007/health');
  });

  it('keeps Node Docker package-copy lists aware of the fashion workspace', async () => {
    const dockerfiles = [
      'gateway/Dockerfile',
      'services/auth/Dockerfile',
      'services/user/Dockerfile',
      'services/retail/Dockerfile',
      'services/para/Dockerfile',
      'services/alimentation/Dockerfile',
      'services/mailer-api/Dockerfile',
      'services/fashion/Dockerfile',
    ];

    for (const dockerfile of dockerfiles) {
      const source = await readFile(path.join(process.cwd(), dockerfile), 'utf8');

      expect(source, `${dockerfile} should copy fashion package.json`).toContain(
        'COPY services/fashion/package.json ./services/fashion/package.json',
      );
    }
  });
});
