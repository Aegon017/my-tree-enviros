import type { Product } from "./product";

export interface CartItem {
  id: number;
  user_id: number;
  type: number;
  product_type: number;
  location_id: number;
  product_id: number;
  cart_type: number;
  coupon_code: string | null;
  quantity: number;
  duration: number;
  name: string;
  occasion: string;
  message: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  ecom_product: Product;
}
