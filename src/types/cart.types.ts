import type { Product } from "./product.types";
import type { Campaign, CampaignType } from "./campaign";
import type { ProductVariant } from "./variant.types";
import { Plan } from "./tree.types";

export interface CartItem {
  id: number;
  clientId?: number; // For guest cart items
  cart_id?: number;
  item_type?: string;
  quantity: number;
  price: number;
  amount?: number; // Alias for price in some contexts
  formatted_price?: string;
  subtotal?: number;
  total_amount?: number; // Alias for subtotal
  formatted_subtotal?: string;

  name: string;
  type?: "tree" | "product" | "campaign";
  image_url: string;
  slug?: string;
  product_type?: number;
  duration?: number;
  occasion?: string;
  message?: string;
  location_id?: number;

  campaign_type?: CampaignType;
  location?: string;
  description?: string;

  /** Always linked to a variant */
  product_variant_id?: number;
  variant?: {
    id?: number;
    name?: string;
    sku?: string;
    color?: string;
    size?: string;
    planter?: string;
    color_id?: number;
    size_id?: number;
    planter_id?: number;
  };

  metadata?: {
    duration?: number;
    occasion?: string;
    message?: string;
    location_id?: number;
    product_variant_id?: number;
    selected_variant?: ProductVariant | null;
    product_data?: Product | null;
  };

  user_id?: number;
  product_id?: number;
  tree_id?: number;

  item?: {
    type?: string;
    name?: string;
    sku?: string;
    image?: string;
    variant?: any;
    color?: any;
    size?: any;
    product?: Product;
  };

  options?: any;
  created_at?: string;
  updated_at?: string;

  product?: Product;
  ecom_product?: Product;
  tree?: any;
  campaign?: Campaign;
  dedication?: Dedication;
  plan?: Plan;
  plan_id?: number;
  plan_price_id?: number;
  available_plans?: any[];
}

export interface Dedication {
  name: string;
  occasion: string;
  message: string;
}

export interface BackendCartItem {
  id: number;
  user_id: number;
  type: number;
  product_type: number;
  location_id: number;
  product_id: number;
  product_variant_id?: number;
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
  ecom_product?: Product;
  product?: Product;
  product_variant?: ProductVariant | null;
}

export interface BackendCartResponse {
  id: number;
  cart_id: number;
  item_type?: string;
  quantity: number;
  price: number;
  formatted_price?: string;
  subtotal?: number;
  formatted_subtotal?: string;
  items?: CartItem[]; // Add items array
  item?: {
    type?: string;
    name?: string;
    sku?: string;
    image?: string;
    product?: Product;
    variant?: {
      sku?: string;
      size?: string;
      color?: string;
      planter?: string;
    };
  };
  options?: any;
  created_at?: string;
  updated_at?: string;
}
