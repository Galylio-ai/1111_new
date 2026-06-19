import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';
import * as validators from '../services/web-control/src/validators/web-control.validators';
import { createWebControlService } from '../services/web-control/src/services/web-control.service';

describe('web-control validators', () => {
  it('validates reusable statuses, domains, ids, and section item references', () => {
    expect(validators.statusSchema.safeParse('active').success).toBe(true);
    expect(validators.statusSchema.safeParse('deleted').success).toBe(false);
    expect(validators.catalogDomainSchema.safeParse('fashion').success).toBe(true);
    expect(validators.catalogDomainSchema.safeParse('cars').success).toBe(false);
    expect(validators.uuidParamSchema.safeParse({ id: 'not-a-uuid' }).success).toBe(false);

    expect(
      validators.createSectionItemSchema.safeParse({
        section_id: '11111111-1111-4111-8111-111111111111',
        item_type: 'product',
        catalog_domain: 'retail',
        product_id: 15,
        display_order: 2,
      }).success,
    ).toBe(true);
  });
});

describe('web-control service', () => {
  it('creates, updates, archives, and lists front-office control records through repositories', async () => {
    const calls: string[] = [];
    const repository = {
      createBanner: async (input: unknown) => {
        calls.push('createBanner');
        return { id: 'banner-1', ...input };
      },
      listBanners: async () => ({ items: [{ id: 'banner-1' }], total: 1, page: 1, limit: 20 }),
      getBannerById: async () => ({ id: 'banner-1', title: 'Summer' }),
      updateBanner: async (_id: string, input: unknown) => {
        calls.push('updateBanner');
        return { id: 'banner-1', ...input };
      },
      archiveBanner: async () => {
        calls.push('archiveBanner');
        return { id: 'banner-1', status: 'archived' };
      },
      createSection: async (input: unknown) => ({ id: 'section-1', ...input }),
      listSections: async () => ({ items: [{ id: 'section-1' }], total: 1, page: 1, limit: 20 }),
      getSectionById: async () => ({ id: 'section-1' }),
      updateSection: async (_id: string, input: unknown) => ({ id: 'section-1', ...input }),
      archiveSection: async () => ({ id: 'section-1', status: 'archived' }),
      createSectionItem: async (input: unknown) => ({ id: 'item-1', ...input }),
      listSectionItems: async () => ({ items: [{ id: 'item-1' }], total: 1, page: 1, limit: 20 }),
      getSectionItemById: async () => ({ id: 'item-1' }),
      updateSectionItem: async (_id: string, input: unknown) => ({ id: 'item-1', ...input }),
      deleteSectionItem: async () => true,
      createFooterGroup: async (input: unknown) => ({ id: 'group-1', ...input }),
      listFooterGroups: async () => ({ items: [{ id: 'group-1' }], total: 1, page: 1, limit: 20 }),
      getFooterGroupById: async () => ({ id: 'group-1' }),
      updateFooterGroup: async (_id: string, input: unknown) => ({ id: 'group-1', ...input }),
      archiveFooterGroup: async () => ({ id: 'group-1', status: 'archived' }),
      createFooterLink: async (input: unknown) => ({ id: 'link-1', ...input }),
      listFooterLinks: async () => ({ items: [{ id: 'link-1' }], total: 1, page: 1, limit: 20 }),
      getFooterLinkById: async () => ({ id: 'link-1' }),
      updateFooterLink: async (_id: string, input: unknown) => ({ id: 'link-1', ...input }),
      archiveFooterLink: async () => ({ id: 'link-1', status: 'archived' }),
      upsertSetting: async (key: string, value: unknown) => ({ key, value }),
      listSettings: async () => [{ key: 'theme', value: { mode: 'dark' } }],
      getSettingByKey: async (key: string) => ({ key, value: { mode: 'dark' } }),
    };

    const service = createWebControlService({ repository });

    await service.createBanner({ title: 'Summer', placement: 'home.hero' });
    await service.updateBanner('banner-1', { title: 'Winter' });
    const archived = await service.archiveBanner('banner-1');
    const sections = await service.listSections({});
    const setting = await service.upsertSetting('theme', { mode: 'dark' });

    expect(calls).toEqual(['createBanner', 'updateBanner', 'archiveBanner']);
    expect(archived).toMatchObject({ status: 'archived' });
    expect(sections.total).toBe(1);
    expect(setting).toEqual({ key: 'theme', value: { mode: 'dark' } });
  });
});

describe('web-control wiring', () => {
  it('registers workspace, Docker, env, and shared migration entries', async () => {
    const rootPackage = JSON.parse(await readFile(path.join(process.cwd(), 'package.json'), 'utf8'));
    const envExample = await readFile(path.join(process.cwd(), '.env.example'), 'utf8');
    const compose = await readFile(path.join(process.cwd(), 'docker-compose.yml'), 'utf8');
    const migration = await readFile(
      path.join(process.cwd(), 'shared', 'db', 'migrations', '006_web_control.js'),
      'utf8',
    );

    expect(rootPackage.workspaces).toContain('services/web-control');
    expect(rootPackage.scripts['dev:web-control']).toBe('cd services/web-control && npm run dev');
    expect(envExample).toContain('WEB_CONTROL_SERVICE_URL=http://web-control:3009');
    expect(envExample).toContain('WEB_CONTROL_PORT=3009');
    expect(compose).toContain('web-control:');
    expect(compose).toContain('http://localhost:3009/health');

    for (const expected of [
      'web_banners',
      'web_sections',
      'web_section_items',
      'web_footer_groups',
      'web_footer_links',
      'web_settings',
      "catalog_domain TEXT NULL CHECK (catalog_domain IN ('retail', 'para', 'alimentation', 'fashion'))",
    ]) {
      expect(migration).toContain(expected);
    }
  });
});
