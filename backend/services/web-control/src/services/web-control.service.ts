import { AppError } from '../utils/errors';

export type WebControlRepository = typeof import('../repositories/web-control.repository');

const lazyRepository: WebControlRepository = {
  createBanner: async (...args) => (await import('../repositories/web-control.repository')).createBanner(...args),
  listBanners: async (...args) => (await import('../repositories/web-control.repository')).listBanners(...args),
  getBannerById: async (...args) => (await import('../repositories/web-control.repository')).getBannerById(...args),
  updateBanner: async (...args) => (await import('../repositories/web-control.repository')).updateBanner(...args),
  archiveBanner: async (...args) => (await import('../repositories/web-control.repository')).archiveBanner(...args),
  createSection: async (...args) => (await import('../repositories/web-control.repository')).createSection(...args),
  listSections: async (...args) => (await import('../repositories/web-control.repository')).listSections(...args),
  getSectionById: async (...args) => (await import('../repositories/web-control.repository')).getSectionById(...args),
  updateSection: async (...args) => (await import('../repositories/web-control.repository')).updateSection(...args),
  archiveSection: async (...args) => (await import('../repositories/web-control.repository')).archiveSection(...args),
  createSectionItem: async (...args) => (await import('../repositories/web-control.repository')).createSectionItem(...args),
  listSectionItems: async (...args) => (await import('../repositories/web-control.repository')).listSectionItems(...args),
  getSectionItemById: async (...args) => (await import('../repositories/web-control.repository')).getSectionItemById(...args),
  updateSectionItem: async (...args) => (await import('../repositories/web-control.repository')).updateSectionItem(...args),
  deleteSectionItem: async (...args) => (await import('../repositories/web-control.repository')).deleteSectionItem(...args),
  createFooterGroup: async (...args) => (await import('../repositories/web-control.repository')).createFooterGroup(...args),
  listFooterGroups: async (...args) => (await import('../repositories/web-control.repository')).listFooterGroups(...args),
  getFooterGroupById: async (...args) => (await import('../repositories/web-control.repository')).getFooterGroupById(...args),
  updateFooterGroup: async (...args) => (await import('../repositories/web-control.repository')).updateFooterGroup(...args),
  archiveFooterGroup: async (...args) => (await import('../repositories/web-control.repository')).archiveFooterGroup(...args),
  createFooterLink: async (...args) => (await import('../repositories/web-control.repository')).createFooterLink(...args),
  listFooterLinks: async (...args) => (await import('../repositories/web-control.repository')).listFooterLinks(...args),
  getFooterLinkById: async (...args) => (await import('../repositories/web-control.repository')).getFooterLinkById(...args),
  updateFooterLink: async (...args) => (await import('../repositories/web-control.repository')).updateFooterLink(...args),
  archiveFooterLink: async (...args) => (await import('../repositories/web-control.repository')).archiveFooterLink(...args),
  upsertSetting: async (...args) => (await import('../repositories/web-control.repository')).upsertSetting(...args),
  listSettings: async (...args) => (await import('../repositories/web-control.repository')).listSettings(...args),
  getSettingByKey: async (...args) => (await import('../repositories/web-control.repository')).getSettingByKey(...args),
  createMediaAsset: async (...args) => (await import('../repositories/web-control.repository')).createMediaAsset(...args),
  listMediaAssets: async (...args) => (await import('../repositories/web-control.repository')).listMediaAssets(...args),
  getMediaAssetById: async (...args) => (await import('../repositories/web-control.repository')).getMediaAssetById(...args),
  archiveMediaAsset: async (...args) => (await import('../repositories/web-control.repository')).archiveMediaAsset(...args),
};

function requireRow<T>(row: T | null, message: string): T {
  if (!row) throw new AppError(404, message);
  return row;
}

export function createWebControlService(deps: { repository?: WebControlRepository } = {}) {
  const repository = deps.repository ?? lazyRepository;

  return {
    createBanner: repository.createBanner,
    listBanners: repository.listBanners,
    getBannerById: async (id: string) => requireRow(await repository.getBannerById(id), 'Banner not found'),
    updateBanner: async (id: string, input: Parameters<WebControlRepository['updateBanner']>[1]) =>
      requireRow(await repository.updateBanner(id, input), 'Banner not found'),
    archiveBanner: async (id: string) => requireRow(await repository.archiveBanner(id), 'Banner not found'),

    createSection: repository.createSection,
    listSections: repository.listSections,
    getSectionById: async (id: string) => requireRow(await repository.getSectionById(id), 'Section not found'),
    updateSection: async (id: string, input: Parameters<WebControlRepository['updateSection']>[1]) =>
      requireRow(await repository.updateSection(id, input), 'Section not found'),
    archiveSection: async (id: string) => requireRow(await repository.archiveSection(id), 'Section not found'),

    createSectionItem: repository.createSectionItem,
    listSectionItems: repository.listSectionItems,
    getSectionItemById: async (id: string) =>
      requireRow(await repository.getSectionItemById(id), 'Section item not found'),
    updateSectionItem: async (id: string, input: Parameters<WebControlRepository['updateSectionItem']>[1]) =>
      requireRow(await repository.updateSectionItem(id, input), 'Section item not found'),
    deleteSectionItem: async (id: string) => {
      const deleted = await repository.deleteSectionItem(id);
      if (!deleted) throw new AppError(404, 'Section item not found');
      return { id };
    },

    createFooterGroup: repository.createFooterGroup,
    listFooterGroups: repository.listFooterGroups,
    getFooterGroupById: async (id: string) =>
      requireRow(await repository.getFooterGroupById(id), 'Footer group not found'),
    updateFooterGroup: async (id: string, input: Parameters<WebControlRepository['updateFooterGroup']>[1]) =>
      requireRow(await repository.updateFooterGroup(id, input), 'Footer group not found'),
    archiveFooterGroup: async (id: string) =>
      requireRow(await repository.archiveFooterGroup(id), 'Footer group not found'),

    createFooterLink: repository.createFooterLink,
    listFooterLinks: repository.listFooterLinks,
    getFooterLinkById: async (id: string) =>
      requireRow(await repository.getFooterLinkById(id), 'Footer link not found'),
    updateFooterLink: async (id: string, input: Parameters<WebControlRepository['updateFooterLink']>[1]) =>
      requireRow(await repository.updateFooterLink(id, input), 'Footer link not found'),
    archiveFooterLink: async (id: string) =>
      requireRow(await repository.archiveFooterLink(id), 'Footer link not found'),

    upsertSetting: repository.upsertSetting,
    listSettings: repository.listSettings,
    getSettingByKey: async (key: string) =>
      requireRow(await repository.getSettingByKey(key), 'Setting not found'),

    createMediaAsset: repository.createMediaAsset,
    listMediaAssets: repository.listMediaAssets,
    getMediaAssetById: async (id: string) =>
      requireRow(await repository.getMediaAssetById(id), 'Media asset not found'),
    archiveMediaAsset: async (id: string) =>
      requireRow(await repository.archiveMediaAsset(id), 'Media asset not found'),
  };
}

const service = createWebControlService();

export const createBanner = service.createBanner;
export const listBanners = service.listBanners;
export const getBannerById = service.getBannerById;
export const updateBanner = service.updateBanner;
export const archiveBanner = service.archiveBanner;
export const createSection = service.createSection;
export const listSections = service.listSections;
export const getSectionById = service.getSectionById;
export const updateSection = service.updateSection;
export const archiveSection = service.archiveSection;
export const createSectionItem = service.createSectionItem;
export const listSectionItems = service.listSectionItems;
export const getSectionItemById = service.getSectionItemById;
export const updateSectionItem = service.updateSectionItem;
export const deleteSectionItem = service.deleteSectionItem;
export const createFooterGroup = service.createFooterGroup;
export const listFooterGroups = service.listFooterGroups;
export const getFooterGroupById = service.getFooterGroupById;
export const updateFooterGroup = service.updateFooterGroup;
export const archiveFooterGroup = service.archiveFooterGroup;
export const createFooterLink = service.createFooterLink;
export const listFooterLinks = service.listFooterLinks;
export const getFooterLinkById = service.getFooterLinkById;
export const updateFooterLink = service.updateFooterLink;
export const archiveFooterLink = service.archiveFooterLink;
export const upsertSetting = service.upsertSetting;
export const listSettings = service.listSettings;
export const getSettingByKey = service.getSettingByKey;
export const createMediaAsset = service.createMediaAsset;
export const listMediaAssets = service.listMediaAssets;
export const getMediaAssetById = service.getMediaAssetById;
export const archiveMediaAsset = service.archiveMediaAsset;
