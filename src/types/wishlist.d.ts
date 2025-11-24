import type { Product } from "./product.types";
import { ProductVariant } from "./variant.types";

export interface WishlistItem {
  id: number;
  product: Product;
  variant: ProductVariant;
}
