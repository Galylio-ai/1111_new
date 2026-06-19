import { CategoryTreeNode, LowCategory, Subcategory, TopCategory } from '../entities/catalog.entities';

export function buildCategoryTree(input: {
  topCategories: TopCategory[];
  lowCategories: LowCategory[];
  subcategories: Subcategory[];
}): CategoryTreeNode[] {
  const lowsByTop = new Map<number, Array<LowCategory & { subcategories: Subcategory[] }>>();
  const subsByLow = new Map<number, Subcategory[]>();

  for (const subcategory of input.subcategories) {
    const current = subsByLow.get(subcategory.low_category_id) ?? [];
    current.push(subcategory);
    subsByLow.set(subcategory.low_category_id, current);
  }

  for (const lowCategory of input.lowCategories) {
    const current = lowsByTop.get(lowCategory.top_category_id) ?? [];
    current.push({
      ...lowCategory,
      subcategories: subsByLow.get(lowCategory.id) ?? [],
    });
    lowsByTop.set(lowCategory.top_category_id, current);
  }

  return input.topCategories.map((topCategory) => ({
    ...topCategory,
    low_categories: lowsByTop.get(topCategory.id) ?? [],
  }));
}
