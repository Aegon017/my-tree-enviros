import type { Product } from "./product.types";

export interface WishlistItem {
  id: number;
  user_id: number;
  tree_id: number;
  product_type: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  trash: number;
  status: number;
  product: Product;
}
