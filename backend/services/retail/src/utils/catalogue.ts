import {
  ProductDetails,
  Shop,
  ShopCatalogue,
  ShopPrice,
} from '../entities/catalog.entities';

export function composeShopCatalogue(input: {
  shop: Partial<Shop>;
  prices: ShopPrice[];
  products: ProductDetails[];
}): ShopCatalogue {
  const priceByProductId = new Map(input.prices.map((price) => [Number(price.product_id), price]));

  return {
    shop: input.shop,
    products: input.products.map((productDetails) => ({
      product: productDetails.product,
      brand: productDetails.brand,
      categories: productDetails.categories,
      images: productDetails.images,
      specs: productDetails.specs,
      current_price: priceByProductId.get(Number(productDetails.product.id)) ?? null,
    })),
  };
}
