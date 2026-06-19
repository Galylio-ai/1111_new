export type Status = 'active' | 'archived' | 'hidden';
export type CatalogDomain = 'retail' | 'para' | 'alimentation' | 'fashion';
export type CategoryLevel = 'top' | 'low' | 'sub';

export interface WebBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  placement: string;
  display_order: number;
  catalog_domain: CatalogDomain | null;
  category_level: CategoryLevel | null;
  category_id: number | null;
  product_id: number | null;
  status: Status;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface WebSection {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  section_type: string;
  display_order: number;
  status: Status;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface WebSectionItem {
  id: string;
  section_id: string;
  item_type: string;
  catalog_domain: CatalogDomain | null;
  category_level: CategoryLevel | null;
  category_id: number | null;
  product_id: number | null;
  title: string | null;
  image_url: string | null;
  cta_url: string | null;
  display_order: number;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface WebFooterGroup {
  id: string;
  title: string;
  display_order: number;
  status: Status;
  created_at: Date;
  updated_at: Date;
}

export interface WebFooterLink {
  id: string;
  group_id: string;
  label: string;
  href: string;
  display_order: number;
  status: Status;
  created_at: Date;
  updated_at: Date;
}

export interface WebSetting {
  key: string;
  value: Record<string, unknown>;
  updated_at: Date;
}

export interface WebMediaAsset {
  id: string;
  filename: string;
  original_name: string;
  mime_type: 'image/jpeg' | 'image/png' | 'image/webp';
  size_bytes: number;
  url: string;
  uploaded_by: string | null;
  status: Status;
  created_at: Date;
  updated_at: Date;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
