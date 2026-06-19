import { PriceValue, ProductImage, ProductSpec, Status } from './catalog.entities';

export type ImportSourceType = 'json' | 'csv';
export type ImportJobStatus =
  | 'previewed'
  | 'running'
  | 'completed'
  | 'completed_with_errors'
  | 'failed';

export interface ImportJob {
  id: string;
  source_type: ImportSourceType;
  status: ImportJobStatus;
  total_rows: number;
  valid_rows: number;
  created_count: number;
  updated_count: number;
  failed_count: number;
  archived_count: number;
  mapping: Record<string, string>;
  summary: Record<string, unknown>;
  created_at?: Date | string;
  finished_at?: Date | string | null;
}

export interface ImportErrorRecord {
  id?: string;
  import_job_id?: string;
  row_number: number;
  source_row: Record<string, unknown>;
  error_code: string;
  error_message: string;
  created_at?: Date | string;
}

export interface ImportPayload {
  source_type: ImportSourceType;
  mapping: Record<string, string>;
  rows?: Array<Record<string, unknown>>;
  csv?: string;
}

export interface ImportShopPriceInput {
  shop_id?: number;
  shop_key?: string;
  current_price: PriceValue;
  regular_price: PriceValue;
  shop_product_url: string;
  recorded_at: string;
}

export interface MappedImportProduct {
  name: string;
  slug?: string;
  brand_id?: number | null;
  brand_name?: string;
  description?: string | null;
  source_product_id?: string | null;
  source_url?: string | null;
  status?: Status;
  subcategory_ids: number[];
  images: ProductImage[];
  specs: ProductSpec[];
  shop_prices: ImportShopPriceInput[];
  force_price_history?: boolean;
}
