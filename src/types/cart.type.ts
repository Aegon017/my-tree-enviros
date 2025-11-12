import type { Product, ProductVariant } from "./product.types";
import type { Campaign, CampaignType } from "./campaign";

export interface CartItem {
  id: number;
  cart_id?: number;
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
    variant?: any;
    color?: any;
    size?: any;
    product?: any; 
  };
  options?: any;
  created_at?: string;
  updated_at?: string;

  
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
  variant?: {
    id?: number;
    name?: string;
    value?: string;
    sku?: string;
    color?: string;
    size?: string;
    planter?: string;
    color_id?: number;
    size_id?: number;
    planter_id?: number;
  };
  product_variant_id?: number;
  metadata?: {
    duration?: number;
    occasion?: string;
    message?: string;
    location_id?: number;
    plan_id?: number;
    product_variant_id?: number;
    selected_variant?: any;
    product_data?: any;
  };
  
  user_id?: number;
  product_id?: number;
  tree_id?: number;
  
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
  product_variant?: ProductVariant;
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
    variant?: {
      sku?: string;
      size?: string;
      color?: string;
    };
    color?: any;
    size?: any;
    product?: Product; 
  };
  options?: any;
  created_at?: string;
  updated_at?: string;
}


export function transformBackendCartItem(item: BackendCartResponse): CartItem {
  
  const productData = item.item;
  const product = productData?.product;
  
  
  let variantInfo = null;
  if (product?.variants && product.variants.length > 0) {
    variantInfo = product.variants[0]; 
  }
  
  return {
    id: item.cart_id,
    cart_id: item.cart_id,
    name: productData?.name || product?.name || "",
    type: "product" as const,
    price: item.price,
    quantity: item.quantity,
    image: productData?.image || product?.thumbnail_url || "",
    slug: product?.slug,
    product_type: 2, 
    formatted_price: item.formatted_price,
    subtotal: item.subtotal,
    formatted_subtotal: item.formatted_subtotal,
    variant: variantInfo
      ? {
          id: variantInfo.id,
          name: variantInfo.variant_name,
          sku: variantInfo.sku,
          color: variantInfo.variant?.color?.name,
          size: variantInfo.variant?.size?.name,
          planter: variantInfo.variant?.planter?.name,
          color_id: variantInfo.variant?.color?.id,
          size_id: variantInfo.variant?.size?.id,
          planter_id: variantInfo.variant?.planter?.id,
        }
      : undefined,
    item: productData, 
    options: item.options,
    created_at: item.created_at,
    updated_at: item.updated_at,
    product: product,
    ecom_product: product,
  };
}


export function transformBackendCart(item: BackendCartItem): CartItem {
  const product = item.product || item.ecom_product;
  const variant = item.product_variant;
  let itemPrice = 0;
  let itemName = item.name || product?.name || "";
  let itemImage = product?.thumbnail_url || "";

  if (variant) {
    
    itemPrice = variant.original_price;
    itemImage = variant.image_urls?.[0]?.url || itemImage;
    
  } else {
    
    itemPrice =
      typeof product?.selling_price === "string"
        ? parseFloat(product.selling_price)
        : product?.selling_price || 0;
  }

  return {
    id: item.product_id,
    cart_id: item.id,
    name: itemName,
    type: item.product_type === 1 ? "product" : "tree",
    price: itemPrice,
    quantity: item.quantity,
    image: itemImage,
    slug: product?.slug,
    product_type: item.product_type,
    duration: item.duration,
    occasion: item.occasion,
    message: item.message,
    location_id: item.location_id,
    product_variant_id: item.product_variant_id,
    variant: variant
      ? {
          id: variant.id,
          name: variant.variant_name,
          sku: variant.sku,
          color: variant.variant.color?.name,
          size: variant.variant.size?.name,
          planter: variant.variant.planter?.name,
          color_id: variant.variant.color?.id,
          size_id: variant.variant.size?.id,
          planter_id: variant.variant.planter?.id,
        }
      : undefined,
    metadata: {
      duration: item.duration,
      occasion: item.occasion,
      message: item.message,
      location_id: item.location_id,
      product_variant_id: item.product_variant_id,
    },
    user_id: item.user_id,
    product_id: item.product_id,
    created_at: item.created_at,
    updated_at: item.updated_at,
    product: product,
    ecom_product: item.ecom_product,
  };
}
