import { describe, expect, it, vi } from 'vitest';
import * as validators from '../services/engagement/src/validators/engagement.validators';
import { createEngagementService } from '../services/engagement/src/services/engagement.service';

const userId = '11111111-1111-4111-8111-111111111111';
const otherUserId = '22222222-2222-4222-8222-222222222222';

describe('engagement validators', () => {
  it('rejects invalid ids, domains, alert types, and product ids', () => {
    expect(validators.uuidParamSchema.safeParse({ id: 'bad-id' }).success).toBe(false);
    expect(validators.favoriteInputSchema.safeParse({ catalog_domain: 'cars', product_id: 1 }).success).toBe(false);
    expect(validators.favoriteInputSchema.safeParse({ catalog_domain: 'retail', product_id: 0 }).success).toBe(false);
    expect(
      validators.alertInputSchema.safeParse({
        catalog_domain: 'retail',
        product_id: 1,
        alert_type: 'price_changed',
      }).success,
    ).toBe(false);
  });

  it('accepts supported domains and alert types', () => {
    expect(validators.favoriteInputSchema.parse({ catalog_domain: 'fashion', product_id: '12' })).toEqual({
      catalog_domain: 'fashion',
      product_id: 12,
    });
    expect(
      validators.alertInputSchema.parse({
        catalog_domain: 'para',
        product_id: '9',
        alert_type: 'promotion',
      }),
    ).toEqual({ catalog_domain: 'para', product_id: 9, alert_type: 'promotion' });
  });
});

describe('engagement service', () => {
  function setup(overrides: Record<string, unknown> = {}) {
    const engagementRepository = {
      findFavoriteByUserAndProduct: vi.fn(async () => null),
      createFavorite: vi.fn(async (input) => ({ id: 'favorite-id', ...(input as object) })),
      listFavoritesByUser: vi.fn(async () => [{ id: 'favorite-id', user_id: userId }]),
      findFavoriteByIdForUser: vi.fn(async () => ({ id: 'favorite-id', user_id: userId })),
      deleteFavoriteByIdForUser: vi.fn(async () => 1),
      findAlertByUserProductAndType: vi.fn(async () => null),
      createAlert: vi.fn(async (input) => ({ id: 'alert-id', ...(input as object) })),
      listAlertsByUser: vi.fn(async () => [{ id: 'alert-id', user_id: userId }]),
      findAlertByIdForUser: vi.fn(async () => ({
        id: 'alert-id',
        user_id: userId,
        catalog_domain: 'retail',
        product_id: 1,
        alert_type: 'price_drop',
      })),
      findAlertByUserProductTypeExcludingId: vi.fn(async () => null),
      updateAlertByIdForUser: vi.fn(async (_userId, id, input) => ({ id, ...(input as object) })),
      deleteAlertByIdForUser: vi.fn(async () => 1),
      ...overrides,
    };

    return {
      engagementRepository,
      service: createEngagementService({ engagementRepository: engagementRepository as never }),
    };
  }

  it('creates favorites with the authenticated user id and returns duplicates idempotently', async () => {
    const { service, engagementRepository } = setup();

    await service.createFavorite(userId, { catalog_domain: 'retail', product_id: 5 });
    expect(engagementRepository.createFavorite).toHaveBeenCalledWith({
      user_id: userId,
      catalog_domain: 'retail',
      product_id: 5,
    });

    engagementRepository.findFavoriteByUserAndProduct.mockResolvedValueOnce({
      id: 'existing-favorite',
      user_id: userId,
      catalog_domain: 'retail',
      product_id: 5,
    });

    await expect(
      service.createFavorite(userId, { catalog_domain: 'retail', product_id: 5 }),
    ).resolves.toMatchObject({ id: 'existing-favorite' });
    expect(engagementRepository.createFavorite).toHaveBeenCalledTimes(1);
  });

  it('lists, gets, and deletes favorites scoped to the authenticated user', async () => {
    const { service, engagementRepository } = setup();

    await service.listFavorites(userId);
    await service.getFavorite(userId, 'favorite-id');
    await service.deleteFavorite(userId, 'favorite-id');

    expect(engagementRepository.listFavoritesByUser).toHaveBeenCalledWith(userId);
    expect(engagementRepository.findFavoriteByIdForUser).toHaveBeenCalledWith(userId, 'favorite-id');
    expect(engagementRepository.deleteFavoriteByIdForUser).toHaveBeenCalledWith(userId, 'favorite-id');
  });

  it('does not allow reading another user favorite', async () => {
    const { service } = setup({
      findFavoriteByIdForUser: vi.fn(async () => null),
    });

    await expect(service.getFavorite(otherUserId, 'favorite-id')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('creates alerts with the authenticated user id and returns duplicates idempotently', async () => {
    const { service, engagementRepository } = setup();

    await service.createAlert(userId, {
      catalog_domain: 'fashion',
      product_id: 7,
      alert_type: 'price_drop',
    });
    expect(engagementRepository.createAlert).toHaveBeenCalledWith({
      user_id: userId,
      catalog_domain: 'fashion',
      product_id: 7,
      alert_type: 'price_drop',
    });

    engagementRepository.findAlertByUserProductAndType.mockResolvedValueOnce({
      id: 'existing-alert',
      user_id: userId,
      catalog_domain: 'fashion',
      product_id: 7,
      alert_type: 'price_drop',
    });

    await expect(
      service.createAlert(userId, {
        catalog_domain: 'fashion',
        product_id: 7,
        alert_type: 'price_drop',
      }),
    ).resolves.toMatchObject({ id: 'existing-alert' });
    expect(engagementRepository.createAlert).toHaveBeenCalledTimes(1);
  });

  it('updates alert type while preserving ownership and uniqueness', async () => {
    const { service, engagementRepository } = setup();

    await service.updateAlert(userId, 'alert-id', { alert_type: 'back_in_stock' });

    expect(engagementRepository.findAlertByIdForUser).toHaveBeenCalledWith(userId, 'alert-id');
    expect(engagementRepository.findAlertByUserProductTypeExcludingId).toHaveBeenCalledWith(
      userId,
      'retail',
      1,
      'back_in_stock',
      'alert-id',
    );
    expect(engagementRepository.updateAlertByIdForUser).toHaveBeenCalledWith(userId, 'alert-id', {
      alert_type: 'back_in_stock',
    });
  });
});
