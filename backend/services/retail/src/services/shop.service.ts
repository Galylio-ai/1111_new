import * as shopRepositoryDefault from '../repositories/shop.repository';
import * as productRepositoryDefault from '../repositories/product.repository';
import { Shop, Status } from '../entities/catalog.entities';
import { AppError } from '../middleware/errorHandler';
import { composeShopCatalogue } from '../utils/catalogue';
import { makeUniqueSlug } from '../utils/slug';

type ShopRepository = typeof shopRepositoryDefault;
type ProductRepository = typeof productRepositoryDefault;
type ListOptions = { page?: number; limit?: number; status?: Status };

export function createShopService(
  deps: { shopRepository?: ShopRepository; productRepository?: ProductRepository } = {},
) {
  const shopRepository = deps.shopRepository ?? shopRepositoryDefault;
  const productRepository = deps.productRepository ?? productRepositoryDefault;

  async function createShop(input: Partial<Shop>) {
    const slug = await makeUniqueSlug(input.slug ?? input.name ?? '', (candidate) =>
      shopRepository.shopSlugExists(candidate),
    );
    return shopRepository.createShop({ ...input, slug });
  }

  async function getShopById(id: number) {
    const row = await shopRepository.getShopById(id);
    if (!row) throw new AppError(404, 'Shop not found');
    return row;
  }

  async function updateShop(id: number, input: Partial<Shop>) {
    const patch = { ...input };
    if (patch.slug) {
      patch.slug = await makeUniqueSlug(patch.slug, (candidate) =>
        shopRepository.shopSlugExists(candidate, id),
      );
    }
    const row = await shopRepository.updateShop(id, patch);
    if (!row) throw new AppError(404, 'Shop not found');
    return row;
  }

  async function getShopCatalogue(shopId: number) {
    const shop = await getShopById(shopId);
    const prices = await shopRepository.getPricesByShopId(shopId);
    const productIds = prices.map((price) => Number(price.product_id));
    const products = await productRepository.getProductDetailsByIds(productIds);
    return composeShopCatalogue({ shop, prices, products });
  }

  return {
    createShop,
    listShops: (options?: ListOptions) => shopRepository.listShops(options),
    getShopById,
    updateShop,
    archiveShop: (id: number) => shopRepository.archiveShop(id),
    getShopCatalogue,
  };
}

const service = createShopService();

export const createShop = service.createShop;
export const listShops = service.listShops;
export const getShopById = service.getShopById;
export const updateShop = service.updateShop;
export const archiveShop = service.archiveShop;
export const getShopCatalogue = service.getShopCatalogue;
