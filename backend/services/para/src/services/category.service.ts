import * as categoryRepositoryDefault from '../repositories/category.repository';
import { AppError } from '../middleware/errorHandler';
import { makeUniqueSlug } from '../utils/slug';
import { LowCategory, Status, Subcategory, TopCategory } from '../entities/catalog.entities';

type CategoryRepository = typeof categoryRepositoryDefault;
type ListOptions = { page?: number; limit?: number; status?: Status };

export function createCategoryService(deps: { categoryRepository?: CategoryRepository } = {}) {
  const categoryRepository = deps.categoryRepository ?? categoryRepositoryDefault;

  async function createTopCategory(input: Partial<TopCategory>) {
    const slug = await makeUniqueSlug(input.slug ?? input.name ?? '', (candidate) =>
      categoryRepository.topCategorySlugExists(candidate),
    );
    return categoryRepository.createTopCategory({ ...input, slug });
  }

  async function updateTopCategory(id: number, input: Partial<TopCategory>) {
    const patch = { ...input };
    if (patch.slug) {
      patch.slug = await makeUniqueSlug(patch.slug, (candidate) =>
        categoryRepository.topCategorySlugExists(candidate, id),
      );
    }
    const row = await categoryRepository.updateTopCategory(id, patch);
    if (!row) throw new AppError(404, 'Top category not found');
    return row;
  }

  async function createLowCategory(input: Partial<LowCategory>) {
    if (!input.top_category_id) throw new AppError(400, 'top_category_id is required');
    await categoryRepository.ensureTopCategoryExists(input.top_category_id);
    const slug = await makeUniqueSlug(input.slug ?? input.name ?? '', (candidate) =>
      categoryRepository.lowCategorySlugExists(Number(input.top_category_id), candidate),
    );
    return categoryRepository.createLowCategory({ ...input, slug });
  }

  async function updateLowCategory(id: number, input: Partial<LowCategory>) {
    const current = await categoryRepository.getLowCategoryById(id);
    if (!current) throw new AppError(404, 'Low category not found');
    const topCategoryId = input.top_category_id ?? current.top_category_id;
    if (input.top_category_id) await categoryRepository.ensureTopCategoryExists(input.top_category_id);
    const patch = { ...input };
    if (patch.slug) {
      patch.slug = await makeUniqueSlug(patch.slug, (candidate) =>
        categoryRepository.lowCategorySlugExists(topCategoryId, candidate, id),
      );
    }
    const row = await categoryRepository.updateLowCategory(id, patch);
    if (!row) throw new AppError(404, 'Low category not found');
    return row;
  }

  async function createSubcategory(input: Partial<Subcategory>) {
    if (!input.low_category_id) throw new AppError(400, 'low_category_id is required');
    await categoryRepository.ensureLowCategoryExists(input.low_category_id);
    const slug = await makeUniqueSlug(input.slug ?? input.name ?? '', (candidate) =>
      categoryRepository.subcategorySlugExists(Number(input.low_category_id), candidate),
    );
    return categoryRepository.createSubcategory({ ...input, slug });
  }

  async function updateSubcategory(id: number, input: Partial<Subcategory>) {
    const current = await categoryRepository.getSubcategoryById(id);
    if (!current) throw new AppError(404, 'Subcategory not found');
    const lowCategoryId = input.low_category_id ?? current.low_category_id;
    if (input.low_category_id) await categoryRepository.ensureLowCategoryExists(input.low_category_id);
    const patch = { ...input };
    if (patch.slug) {
      patch.slug = await makeUniqueSlug(patch.slug, (candidate) =>
        categoryRepository.subcategorySlugExists(lowCategoryId, candidate, id),
      );
    }
    const row = await categoryRepository.updateSubcategory(id, patch);
    if (!row) throw new AppError(404, 'Subcategory not found');
    return row;
  }

  async function moveLowCategory(id: number, topCategoryId: number) {
    await categoryRepository.ensureLowCategoryExists(id);
    await categoryRepository.ensureTopCategoryExists(topCategoryId);
    return categoryRepository.moveLowCategory(id, topCategoryId);
  }

  async function moveSubcategory(id: number, lowCategoryId: number) {
    await categoryRepository.ensureSubcategoryExists(id);
    await categoryRepository.ensureLowCategoryExists(lowCategoryId);
    return categoryRepository.moveSubcategory(id, lowCategoryId);
  }

  async function getRequiredTopCategory(id: number) {
    const row = await categoryRepository.getTopCategoryById(id);
    if (!row) throw new AppError(404, 'Top category not found');
    return row;
  }

  async function getRequiredLowCategory(id: number) {
    const row = await categoryRepository.getLowCategoryById(id);
    if (!row) throw new AppError(404, 'Low category not found');
    return row;
  }

  async function getRequiredSubcategory(id: number) {
    const row = await categoryRepository.getSubcategoryById(id);
    if (!row) throw new AppError(404, 'Subcategory not found');
    return row;
  }

  return {
    createTopCategory,
    listTopCategories: (options?: ListOptions) => categoryRepository.listTopCategories(options),
    getTopCategoryById: getRequiredTopCategory,
    updateTopCategory,
    archiveTopCategory: (id: number) => categoryRepository.archiveTopCategory(id),
    createLowCategory,
    listLowCategories: (options?: ListOptions) => categoryRepository.listLowCategories(options),
    getLowCategoryById: getRequiredLowCategory,
    updateLowCategory,
    archiveLowCategory: (id: number) => categoryRepository.archiveLowCategory(id),
    createSubcategory,
    listSubcategories: (options?: ListOptions) => categoryRepository.listSubcategories(options),
    getSubcategoryById: getRequiredSubcategory,
    updateSubcategory,
    archiveSubcategory: (id: number) => categoryRepository.archiveSubcategory(id),
    getCategoryTree: () => categoryRepository.getCategoryTree(),
    moveLowCategory,
    moveSubcategory,
  };
}

const service = createCategoryService();

export const createTopCategory = service.createTopCategory;
export const listTopCategories = service.listTopCategories;
export const getTopCategoryById = service.getTopCategoryById;
export const updateTopCategory = service.updateTopCategory;
export const archiveTopCategory = service.archiveTopCategory;
export const createLowCategory = service.createLowCategory;
export const listLowCategories = service.listLowCategories;
export const getLowCategoryById = service.getLowCategoryById;
export const updateLowCategory = service.updateLowCategory;
export const archiveLowCategory = service.archiveLowCategory;
export const createSubcategory = service.createSubcategory;
export const listSubcategories = service.listSubcategories;
export const getSubcategoryById = service.getSubcategoryById;
export const updateSubcategory = service.updateSubcategory;
export const archiveSubcategory = service.archiveSubcategory;
export const getCategoryTree = service.getCategoryTree;
export const moveLowCategory = service.moveLowCategory;
export const moveSubcategory = service.moveSubcategory;
