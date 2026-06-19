export type Status = 'active' | 'archived' | 'hidden';
export type PriceValue = number | string | null;

export interface Timestamped {
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface TopCategory extends Timestamped {
  id: number;
  name: string;
  slug: string;
  status: Status;
}

export interface LowCategory extends Timestamped {
  id: number;
  top_category_id: number;
  name: string;
  slug: string;
  status: Status;
}

export interface Subcategory extends Timestamped {
  id: number;
  low_category_id: number;
  name: string;
  slug: string;
  status: Status;
}

export interface CategoryTreeNode extends TopCategory {
  low_categories: Array<LowCategory & { subcategories: Subcategory[] }>;
}

export interface Brand extends Timestamped {
  id: number;
  name: string;
  slug: string;
  status: Status;
}

export interface Product extends Timestamped {
  id: number;
  brand_id: number | null;
  source_product_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  source_url: string | null;
  status: Status;
}

export interface ProductImage {
  id?: number;
  product_id?: number;
  image_url: string;
  created_at?: Date | string;
}

export interface ProductSpec {
  id?: number;
  product_id?: number;
  spec_key: string;
  spec_value: string;
  created_at?: Date | string;
}

export interface Shop extends Timestamped {
  id: number;
  shop_key: string;
  name: string;
  slug: string;
  website_url?: string | null;
  logo_url?: string | null;
  status: Status;
}

export interface ShopPrice {
  product_id: number;
  shop_id: number;
  current_price: PriceValue;
  regular_price: PriceValue;
  shop_product_url: string;
  updated_at?: Date | string;
}

export interface PriceHistory {
  id?: number;
  product_id: number;
  shop_id: number;
  price: PriceValue;
  regular_price: PriceValue;
  recorded_at: Date | string;
  created_at?: Date | string;
}

export interface ProductDetails {
  product: Partial<Product>;
  brand: Partial<Brand> | null;
  categories: Array<Partial<Subcategory>>;
  images: ProductImage[];
  specs: ProductSpec[];
  shop_prices: ShopPrice[];
  price_history: PriceHistory[];
}

export interface ShopCatalogueProduct {
  product: Partial<Product>;
  brand: Partial<Brand> | null;
  categories: Array<Partial<Subcategory>>;
  images: ProductImage[];
  specs: ProductSpec[];
  current_price: ShopPrice | null;
}

export interface ShopCatalogue {
  shop: Partial<Shop>;
  products: ShopCatalogueProduct[];
}
