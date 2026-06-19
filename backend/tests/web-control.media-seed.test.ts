import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';
import * as validators from '../services/web-control/src/validators/web-control.validators';
import { createWebControlService } from '../services/web-control/src/services/web-control.service';

describe('web-control media management', () => {
  it('validates media params and exposes media operations through the service', async () => {
    expect(validators.mediaListQuerySchema.parse({ page: '2', limit: '12', status: 'active' })).toEqual({
      page: 2,
      limit: 12,
      status: 'active',
    });

    const calls: string[] = [];
    const repository = {
      createBanner: async () => ({}),
      listBanners: async () => ({ items: [], total: 0, page: 1, limit: 20 }),
      getBannerById: async () => ({}),
      updateBanner: async () => ({}),
      archiveBanner: async () => ({}),
      createSection: async () => ({}),
      listSections: async () => ({ items: [], total: 0, page: 1, limit: 20 }),
      getSectionById: async () => ({}),
      updateSection: async () => ({}),
      archiveSection: async () => ({}),
      createSectionItem: async () => ({}),
      listSectionItems: async () => ({ items: [], total: 0, page: 1, limit: 20 }),
      getSectionItemById: async () => ({}),
      updateSectionItem: async () => ({}),
      deleteSectionItem: async () => true,
      createFooterGroup: async () => ({}),
      listFooterGroups: async () => ({ items: [], total: 0, page: 1, limit: 20 }),
      getFooterGroupById: async () => ({}),
      updateFooterGroup: async () => ({}),
      archiveFooterGroup: async () => ({}),
      createFooterLink: async () => ({}),
      listFooterLinks: async () => ({ items: [], total: 0, page: 1, limit: 20 }),
      getFooterLinkById: async () => ({}),
      updateFooterLink: async () => ({}),
      archiveFooterLink: async () => ({}),
      upsertSetting: async () => ({}),
      listSettings: async () => [],
      getSettingByKey: async () => ({}),
      createMediaAsset: async (input: unknown) => {
        calls.push('createMediaAsset');
        return { id: 'media-1', ...input };
      },
      listMediaAssets: async () => {
        calls.push('listMediaAssets');
        return { items: [{ id: 'media-1' }], total: 1, page: 1, limit: 20 };
      },
      getMediaAssetById: async () => ({ id: 'media-1' }),
      archiveMediaAsset: async () => {
        calls.push('archiveMediaAsset');
        return { id: 'media-1', status: 'archived' };
      },
    };

    const service = createWebControlService({ repository });
    await service.createMediaAsset({ filename: 'hero.webp', url: '/uploads/web-media/hero.webp' });
    await service.listMediaAssets({});
    const archived = await service.archiveMediaAsset('media-1');

    expect(calls).toEqual(['createMediaAsset', 'listMediaAssets', 'archiveMediaAsset']);
    expect(archived).toMatchObject({ status: 'archived' });
  });

  it('wires media routes, multer dependency, uploads volume, and shared migration', async () => {
    const pkg = JSON.parse(await readFile(path.join(process.cwd(), 'services', 'web-control', 'package.json'), 'utf8'));
    const routes = await readFile(path.join(process.cwd(), 'services', 'web-control', 'src', 'routes', 'web-control.routes.ts'), 'utf8');
    const index = await readFile(path.join(process.cwd(), 'services', 'web-control', 'src', 'index.ts'), 'utf8');
    const compose = await readFile(path.join(process.cwd(), 'docker-compose.yml'), 'utf8');
    const migration = await readFile(
      path.join(process.cwd(), 'shared', 'db', 'migrations', '007_web_media_assets.js'),
      'utf8',
    );

    expect(pkg.dependencies).toHaveProperty('multer');
    expect(routes).toContain("router.post('/media'");
    expect(routes).toContain("router.get('/media'");
    expect(routes).toContain("router.patch('/media/:id/archive'");
    expect(index).toContain("app.use('/uploads', express.static(config.uploadPath))");
    expect(compose).toContain('web-control:');
    expect(compose).toContain('uploads:/app/uploads');
    expect(migration).toContain('web_media_assets');
    expect(migration).toContain("mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp'))");
  });
});

describe('demo seed wiring', () => {
  it('registers an idempotent demo seed script for shared and catalog databases', async () => {
    const rootPackage = JSON.parse(await readFile(path.join(process.cwd(), 'package.json'), 'utf8'));
    const source = await readFile(path.join(process.cwd(), 'scripts', 'seedDemo.js'), 'utf8');

    expect(rootPackage.scripts['seed:demo']).toBe('node scripts/seedDemo.js');
    for (const expected of [
      'seedSharedDatabase',
      'seedCatalogDatabase',
      'retail',
      'para',
      'alimentation',
      'fashion',
      'onConflict',
      'price_history',
      'web_banners',
    ]) {
      expect(source).toContain(expected);
    }
  });
});
