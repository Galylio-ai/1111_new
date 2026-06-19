import * as brandRepositoryDefault from '../repositories/brand.repository';
import { Brand, Status } from '../entities/catalog.entities';
import { AppError } from '../middleware/errorHandler';
import { makeUniqueSlug } from '../utils/slug';

type BrandRepository = typeof brandRepositoryDefault;
type ListOptions = { page?: number; limit?: number; status?: Status };

export function createBrandService(deps: { brandRepository?: BrandRepository } = {}) {
  const brandRepository = deps.brandRepository ?? brandRepositoryDefault;

  async function createBrand(input: Partial<Brand>) {
    const slug = await makeUniqueSlug(input.slug ?? input.name ?? '', (candidate) =>
      brandRepository.brandSlugExists(candidate),
    );
    return brandRepository.createBrand({ ...input, slug });
  }

  async function getBrandById(id: number) {
    const row = await brandRepository.getBrandById(id);
    if (!row) throw new AppError(404, 'Brand not found');
    return row;
  }

  async function updateBrand(id: number, input: Partial<Brand>) {
    const patch = { ...input };
    if (patch.slug) {
      patch.slug = await makeUniqueSlug(patch.slug, (candidate) =>
        brandRepository.brandSlugExists(candidate, id),
      );
    }
    const row = await brandRepository.updateBrand(id, patch);
    if (!row) throw new AppError(404, 'Brand not found');
    return row;
  }

  return {
    createBrand,
    listBrands: (options?: ListOptions) => brandRepository.listBrands(options),
    getBrandById,
    updateBrand,
    archiveBrand: (id: number) => brandRepository.archiveBrand(id),
  };
}

const service = createBrandService();

export const createBrand = service.createBrand;
export const listBrands = service.listBrands;
export const getBrandById = service.getBrandById;
export const updateBrand = service.updateBrand;
export const archiveBrand = service.archiveBrand;
