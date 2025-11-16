import type { Product } from "./product.types";
import type { Campaign, CampaignType } from "./campaign";
import type { ProductVariant } from "./variant.types";

export interface CartItem {
  id: number;
  cart_id?: number;
  item_type?: string;
  quantity: number;
  price: number;
  formatted_price?: string;
  subtotal?: number;
  formatted_subtotal?: string;

  name?: string;
  type?: "tree" | "product" | "campaign";
  image?: string;
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

/**
 * Transform backend response format to CartItem (variant-based)
 */
export function transformBackendCartItem( item: BackendCartResponse ): CartItem {
  const product = item.item?.product;
  const variant = product?.variants?.[ 0 ] ?? null;

  const selectedVariant = variant || null;
  const variantImage = selectedVariant?.image_urls?.[ 0 ]?.url ?? "/placeholder.svg";

  return {
    id: item.cart_id,
    cart_id: item.cart_id,
    name: item.item?.name || selectedVariant?.variant?.name || product?.name || "",
    type: "product",
    price: item.price,
    quantity: item.quantity,
    image: variantImage,
    slug: product?.slug,
    product_type: 2,
    formatted_price: item.formatted_price,
    subtotal: item.subtotal,
    formatted_subtotal: item.formatted_subtotal,
    product_variant_id: selectedVariant?.id,
    variant: selectedVariant
      ? {
        id: selectedVariant.id,
        name: selectedVariant.variant?.name ?? "",
        sku: selectedVariant.sku,
        color: selectedVariant.variant?.color?.name,
        size: selectedVariant.variant?.size?.name,
        planter: selectedVariant.variant?.planter?.name,
        color_id: selectedVariant.variant?.color?.id,
        size_id: selectedVariant.variant?.size?.id,
        planter_id: selectedVariant.variant?.planter?.id,
      }
      : undefined,
    metadata: {
      product_variant_id: selectedVariant?.id,
      selected_variant: selectedVariant,
      product_data: product,
    },
    product,
    ecom_product: product,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

/**
 * Transform BackendCartItem (from DB structure) to frontend CartItem (variant-based)
 */
export function transformBackendCart( item: BackendCartItem ): CartItem {
  const product = item.product || item.ecom_product;
  const variant = item.product_variant ?? null;

  const variantImage = variant?.image_urls?.[ 0 ]?.url ?? "/placeholder.svg";
  const itemPrice = variant?.selling_price ?? 0;

  return {
    id: item.id,
    cart_id: item.id,
    name: variant?.variant?.name || product?.name || "",
    type: "product",
    price: itemPrice,
    quantity: item.quantity,
    image: variantImage,
    slug: product?.slug,
    product_type: item.product_type,
    duration: item.duration,
    occasion: item.occasion,
    message: item.message,
    location_id: item.location_id,
    product_variant_id: variant?.id,
    variant: variant
      ? {
        id: variant.id,
        name: variant.variant?.name ?? "",
        sku: variant.sku,
        color: variant.variant?.color?.name,
        size: variant.variant?.size?.name,
        planter: variant.variant?.planter?.name,
        color_id: variant.variant?.color?.id,
        size_id: variant.variant?.size?.id,
        planter_id: variant.variant?.planter?.id,
      }
      : undefined,
    metadata: {
      duration: item.duration,
      occasion: item.occasion,
      message: item.message,
      location_id: item.location_id,
      product_variant_id: variant?.id,
      selected_variant: variant,
      product_data: product,
    },
    user_id: item.user_id,
    product_id: item.product_id,
    created_at: item.created_at,
    updated_at: item.updated_at,
    product,
    ecom_product: item.ecom_product,
  };
}