export type CatalogDomain = 'retail' | 'para' | 'alimentation' | 'fashion';
export type AlertType = 'price_drop' | 'price_below' | 'back_in_stock' | 'promotion';

export interface Favorite {
  id: string;
  user_id: string;
  catalog_domain: CatalogDomain;
  product_id: number;
  created_at?: Date;
}

export interface Alert {
  id: string;
  user_id: string;
  catalog_domain: CatalogDomain;
  product_id: number;
  alert_type: AlertType;
  created_at?: Date;
}
