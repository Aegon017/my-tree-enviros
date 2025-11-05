"use client";

import api from "@/lib/axios";



export interface WishlistStock {
  is_instock: boolean;
  quantity: number;
}

export interface WishlistItem {
  id: number;
  wishlist_id: number;
  product_id: number;
  product_variant_id?: number | null;
  is_variant: boolean;
  product_name: string;
  product_image?: string | null;
  
  product?: {
    id: number;
    name: string;
    slug: string;
    price: number;
    discount_price?: number | null;
    main_image_url?: string;
    quantity?: number; 
    inventory?: {
      id: number | null;
      stock_quantity: number;
      is_instock: boolean;
      has_variants: boolean;
    };
    
  };
  product_variant?: {
    id: number;
    sku?: string | null;
    color?: string | null;
    size?: string | null;
    variant_name?: string;
    stock_quantity?: number;
    is_instock?: boolean;
    price?: number | null;
    product?: {
      id: number | null;
      name: string | null;
      slug: string | null;
    };
  };
  stock: WishlistStock;
  created_at: string;
  updated_at: string;

  
  
  product_type?: 2;
}

export interface WishlistResource {
  id: number;
  user_id: number;
  items: WishlistItem[];
  total_items: number;
  created_at: string;
  updated_at: string;
}

export interface WishlistApiEnvelope {
  success: boolean;
  message: string;
  data: {
    wishlist: WishlistResource;
  };
}

export interface WishlistMoveToCartEnvelope {
  success: boolean;
  message: string;
  data: {
    cart: unknown;
    wishlist: WishlistResource;
  };
}


export interface WishlistResponse {
  success: boolean;
  message: string;
  data: WishlistItem[];
}

export interface AddToWishlistPayload {
  product_id: number;
  product_variant_id?: number | null;
}

export interface SyncWishlistPayload {
  items: Array<{
    product_id: number;
    product_variant_id?: number | null;
  }>;
}

export interface CheckWishlistResponse {
  success: boolean;
  message: string;
  data: {
    in_wishlist: boolean;
    product_id: number;
    variant_id: number | null;
  };
}


function normalizeItems(
  items: WishlistItem[] | undefined | null,
): WishlistItem[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map((it) => ({
    ...it,
    product_type: 2 as const,
  }));
}


export const wishlistService = {
  
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await api.get<WishlistApiEnvelope>("/wishlist");
    const items = normalizeItems(response.data.data.wishlist.items);
    return {
      success: response.data.success,
      message: response.data.message,
      data: items,
    };
  },

  
  addToWishlist: async (
    payload: AddToWishlistPayload,
  ): Promise<WishlistResponse> => {
    const response = await api.post<WishlistApiEnvelope>(
      "/wishlist/items",
      payload,
    );
    const items = normalizeItems(response.data.data.wishlist.items);
    return {
      success: response.data.success,
      message: response.data.message,
      data: items,
    };
  },

  
  removeFromWishlist: async (itemId: number): Promise<WishlistResponse> => {
    const response = await api.delete<WishlistApiEnvelope>(
      `/wishlist/items/${itemId}`,
    );
    const items = normalizeItems(response.data.data.wishlist.items);
    return {
      success: response.data.success,
      message: response.data.message,
      data: items,
    };
  },

  
  removeByProduct: async (
    productId: number,
    productVariantId?: number | null,
  ): Promise<WishlistResponse> => {
    
    const current = await wishlistService.getWishlist();
    const match = current.data.find(
      (it) =>
        it.product_id === productId &&
        (productVariantId
          ? it.product_variant_id === productVariantId
          : !it.product_variant_id),
    );

    if (!match) {
      
      return current;
    }

    return wishlistService.removeFromWishlist(match.id);
  },

  
  clearWishlist: async (): Promise<WishlistResponse> => {
    const response = await api.delete<WishlistApiEnvelope>("/wishlist");
    const items = normalizeItems(response.data.data.wishlist.items);
    return {
      success: response.data.success,
      message: response.data.message,
      data: items,
    };
  },

  
  moveToCart: async (
    itemId: number,
    quantity?: number,
  ): Promise<WishlistResponse> => {
    const response = await api.post<WishlistMoveToCartEnvelope>(
      `/wishlist/items/${itemId}/move-to-cart`,
      quantity ? { quantity } : undefined,
    );
    const items = normalizeItems(response.data.data.wishlist.items);
    return {
      success: response.data.success,
      message: response.data.message,
      data: items,
    };
  },

  
  checkInWishlist: async (
    productId: number,
    variantId?: number | null,
  ): Promise<CheckWishlistResponse> => {
    const response = await api.get<CheckWishlistResponse>(
      `/wishlist/check/${productId}`,
      {
        params: {
          variant_id: variantId ?? undefined,
        },
      },
    );
    return response.data;
  },

  
  syncWishlist: async (
    payload: SyncWishlistPayload,
  ): Promise<WishlistResponse> => {
    const items = payload?.items ?? [];
    if (items.length === 0) {
      return wishlistService.getWishlist();
    }

    
    for (const item of items) {
      try {
        const check = await wishlistService.checkInWishlist(
          item.product_id,
          item.product_variant_id ?? null,
        );
        if (!check.data.in_wishlist) {
          await wishlistService.addToWishlist({
            product_id: item.product_id,
            product_variant_id: item.product_variant_id ?? null,
          });
        }
      } catch (err) {
        
        
        console.error("Wishlist sync item failed:", err);
      }
    }

    return wishlistService.getWishlist();
  },

  
  toggleWishlist: async (
    productId: number,
    productVariantId?: number | null,
  ): Promise<WishlistResponse> => {
    const check = await wishlistService.checkInWishlist(
      productId,
      productVariantId ?? null,
    );

    if (check.data.in_wishlist) {
      return wishlistService.removeByProduct(
        productId,
        productVariantId ?? null,
      );
    }

    return wishlistService.addToWishlist({
      product_id: productId,
      product_variant_id: productVariantId ?? null,
    });
  },

  
  isAvailable: (item: WishlistItem): boolean => {
    
    const legacy: any = item as any;
    if (legacy?.ecom_product) {
      return (
        legacy.ecom_product.status === 1 && (legacy.ecom_product.stock ?? 0) > 0
      );
    }
    return !!item?.stock?.is_instock && (item?.stock?.quantity ?? 0) > 0;
  },

  
  getProductName: (item: WishlistItem): string => {
    if (item?.product_name) return item.product_name;

    
    const legacy: any = item as any;
    if (legacy?.ecom_product?.name) return legacy.ecom_product.name;

    if (item?.is_variant) {
      const base = item?.product_variant?.product?.name ?? "Product";
      const variant = item?.product_variant?.variant_name ?? "";
      return variant ? `${base} (${variant})` : base;
    }
    return item?.product?.name ?? "Product";
  },

  
  getProductPrice: (item: WishlistItem): number => {
    if (item?.product_variant?.price != null) {
      return Number(item.product_variant.price) || 0;
    }

    
    const legacy: any = item as any;
    if (legacy?.ecom_product?.price != null) {
      return Number(legacy.ecom_product.price) || 0;
    }

    const discount = item?.product?.discount_price;
    if (discount != null) return Number(discount) || 0;
    return Number(item?.product?.price ?? 0) || 0;
  },

  
  getProductImage: (item: WishlistItem): string | undefined => {
    if (item?.product_image) return item.product_image || undefined;

    
    const legacy: any = item as any;
    if (legacy?.ecom_product?.main_image_url) {
      return legacy.ecom_product.main_image_url;
    }

    return item?.product?.main_image_url || undefined;
  },
};


export async function getWishlist() {
  const response = await wishlistService.getWishlist();
  return response.data;
}
