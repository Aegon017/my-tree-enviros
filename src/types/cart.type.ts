import type { Product } from "./product";
import type { Campaign, CampaignType } from "./campaign";

export interface CartItem {
  id: number;
  name: string;
  type: "tree" | "product" | "campaign";
  price: number;
  quantity: number;
  image: string;
  slug?: string;
  product_type?: number;
  duration?: number;
  occasion?: string;
  message?: string;
  location_id?: number;
  // Campaign-specific (when type === "campaign")
  campaign_type?: CampaignType;
  location?: string;
  description?: string;
  variant?: {
    id?: number;
    name?: string;
    value?: string;
  };
  metadata?: {
    duration?: number;
    occasion?: string;
    message?: string;
    location_id?: number;
    plan_id?: number;
  };
  // Backend-specific fields (when synced)
  cart_id?: number;
  user_id?: number;
  product_id?: number;
  tree_id?: number;
  created_at?: string;
  updated_at?: string;
  // Full product/tree/campaign data (from backend)
  product?: Product;
  ecom_product?: Product;
  tree?: any;
  campaign?: Campaign;
}

// Backend cart response format
export interface BackendCartItem {
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
  ecom_product?: Product;
  product?: Product;
}

// Helper to transform backend cart to unified format
export function transformBackendCart(item: BackendCartItem): CartItem {
  const product = item.product || item.ecom_product;
  return {
    id: item.product_id,
    cart_id: item.id,
    name: item.name || product?.name || "",
    type: item.product_type === 1 ? "product" : "tree",
    price:
      typeof product?.price === "string"
        ? parseFloat(product.price)
        : product?.price || 0,
    quantity: item.quantity,
    image: product?.main_image_url || "",
    slug: product?.slug,
    product_type: item.product_type,
    duration: item.duration,
    occasion: item.occasion,
    message: item.message,
    location_id: item.location_id,
    metadata: {
      duration: item.duration,
      occasion: item.occasion,
      message: item.message,
      location_id: item.location_id,
    },
    user_id: item.user_id,
    product_id: item.product_id,
    created_at: item.created_at,
    updated_at: item.updated_at,
    product: product,
    ecom_product: item.ecom_product,
  };
}
