import type { Product } from "./product.types";

export interface WishlistItem {
  id: number;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
}
