import { AlertType, CatalogDomain } from '../entities/engagement.entities';
import { AppError } from '../utils/errors';

type EngagementRepository = typeof import('../repositories/engagement.repository');

const lazyRepository: EngagementRepository = {
  findFavoriteByUserAndProduct: async (...args) => {
    const repository = await import('../repositories/engagement.repository');
    return repository.findFavoriteByUserAndProduct(...args);
  },
  createFavorite: async (...args) => {
    const repository = await import('../repositories/engagement.repository');
    return repository.createFavorite(...args);
  },
  listFavoritesByUser: async (...args) => {
    const repository = await import('../repositories/engagement.repository');
    return repository.listFavoritesByUser(...args);
  },
  findFavoriteByIdForUser: async (...args) => {
    const repository = await import('../repositories/engagement.repository');
    return repository.findFavoriteByIdForUser(...args);
  },
  deleteFavoriteByIdForUser: async (...args) => {
    const repository = await import('../repositories/engagement.repository');
    return repository.deleteFavoriteByIdForUser(...args);
  },
  findAlertByUserProductAndType: async (...args) => {
    const repository = await import('../repositories/engagement.repository');
    return repository.findAlertByUserProductAndType(...args);
  },
  findAlertByUserProductTypeExcludingId: async (...args) => {
    const repository = await import('../repositories/engagement.repository');
    return repository.findAlertByUserProductTypeExcludingId(...args);
  },
  createAlert: async (...args) => {
    const repository = await import('../repositories/engagement.repository');
    return repository.createAlert(...args);
  },
  listAlertsByUser: async (...args) => {
    const repository = await import('../repositories/engagement.repository');
    return repository.listAlertsByUser(...args);
  },
  findAlertByIdForUser: async (...args) => {
    const repository = await import('../repositories/engagement.repository');
    return repository.findAlertByIdForUser(...args);
  },
  updateAlertByIdForUser: async (...args) => {
    const repository = await import('../repositories/engagement.repository');
    return repository.updateAlertByIdForUser(...args);
  },
  deleteAlertByIdForUser: async (...args) => {
    const repository = await import('../repositories/engagement.repository');
    return repository.deleteAlertByIdForUser(...args);
  },
};

export function createEngagementService(
  deps: { engagementRepository?: EngagementRepository } = {},
) {
  const engagementRepository = deps.engagementRepository ?? lazyRepository;

  async function createFavorite(
    userId: string,
    input: { catalog_domain: CatalogDomain; product_id: number },
  ) {
    const existing = await engagementRepository.findFavoriteByUserAndProduct(
      userId,
      input.catalog_domain,
      input.product_id,
    );
    if (existing) return existing;
    return engagementRepository.createFavorite({ user_id: userId, ...input });
  }

  async function getFavorite(userId: string, id: string) {
    const favorite = await engagementRepository.findFavoriteByIdForUser(userId, id);
    if (!favorite) throw new AppError(404, 'Favorite not found');
    return favorite;
  }

  async function deleteFavorite(userId: string, id: string) {
    const deleted = await engagementRepository.deleteFavoriteByIdForUser(userId, id);
    if (!deleted) throw new AppError(404, 'Favorite not found');
    return { deleted: true };
  }

  async function createAlert(
    userId: string,
    input: { catalog_domain: CatalogDomain; product_id: number; alert_type: AlertType },
  ) {
    const existing = await engagementRepository.findAlertByUserProductAndType(
      userId,
      input.catalog_domain,
      input.product_id,
      input.alert_type,
    );
    if (existing) return existing;
    return engagementRepository.createAlert({ user_id: userId, ...input });
  }

  async function getAlert(userId: string, id: string) {
    const alert = await engagementRepository.findAlertByIdForUser(userId, id);
    if (!alert) throw new AppError(404, 'Alert not found');
    return alert;
  }

  async function updateAlert(userId: string, id: string, input: { alert_type: AlertType }) {
    const current = await engagementRepository.findAlertByIdForUser(userId, id);
    if (!current) throw new AppError(404, 'Alert not found');

    const duplicate = await engagementRepository.findAlertByUserProductTypeExcludingId(
      userId,
      current.catalog_domain,
      current.product_id,
      input.alert_type,
      id,
    );
    if (duplicate) return duplicate;

    const updated = await engagementRepository.updateAlertByIdForUser(userId, id, input);
    if (!updated) throw new AppError(404, 'Alert not found');
    return updated;
  }

  async function deleteAlert(userId: string, id: string) {
    const deleted = await engagementRepository.deleteAlertByIdForUser(userId, id);
    if (!deleted) throw new AppError(404, 'Alert not found');
    return { deleted: true };
  }

  return {
    createFavorite,
    listFavorites: engagementRepository.listFavoritesByUser,
    getFavorite,
    deleteFavorite,
    createAlert,
    listAlerts: engagementRepository.listAlertsByUser,
    getAlert,
    updateAlert,
    deleteAlert,
  };
}

const service = createEngagementService();

export const createFavorite = service.createFavorite;
export const listFavorites = service.listFavorites;
export const getFavorite = service.getFavorite;
export const deleteFavorite = service.deleteFavorite;
export const createAlert = service.createAlert;
export const listAlerts = service.listAlerts;
export const getAlert = service.getAlert;
export const updateAlert = service.updateAlert;
export const deleteAlert = service.deleteAlert;
