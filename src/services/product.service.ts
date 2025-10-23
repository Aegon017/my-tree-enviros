"use client";

import api from "@/lib/axios";

export interface ProductVariant {
  id: number;
  product_id: number;
  size?: string;
  color?: string;
  price: number;
  stock: number;
  sku?: string;
}

// Import Product type from types folder
// Product interface is defined in src/types/product.d.ts
export interface ProductFromAPI {
  id: number;
  name: string;
  nick_name: string;
  botanical_name: string;
  slug: string;
  sku: string;
  type: number;
  status: number;
  trash: number;
  category_id: number;
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
    status: number;
  };
  description: string;
  price: number;
  discount_price: number;
  quantity: number;
  main_image: string;
  main_image_url: string;
  reviews: any[];
  wishlist_tag: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  rating: number;
  review_count: number;
  variants?: ProductVariant[];
}

export type Product = ProductFromAPI;

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    data: Product[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
    };
  };
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

export interface ProductParams {
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  sort_by?: "name" | "price" | "created_at";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

/**
 * Product Service for managing e-commerce products
 * Public routes don't require authentication
 */
export const productService = {
  /**
   * Get all products with optional filters
   * @param params - Query parameters for filtering and pagination
   */
  getAll: async (params?: ProductParams): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>("/products", {
      params,
    });
    return response.data;
  },

  /**
   * Get a specific product by ID
   * @param id - Product ID
   */
  getById: async (id: number): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>(`/products/${id}`);
    return response.data;
  },

  /**
   * Get featured products
   * @param limit - Number of products to fetch
   */
  getFeatured: async (limit?: number): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>("/products/featured", {
      params: { per_page: limit },
    });
    return response.data;
  },

  /**
   * Get products by category
   * @param categoryId - Category ID
   * @param params - Additional query parameters
   */
  getByCategory: async (
    categoryId: number,
    params?: ProductParams,
  ): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>(
      `/products/category/${categoryId}`,
      { params },
    );
    return response.data;
  },

  /**
   * Get product variants
   * @param productId - Product ID
   */
  getVariants: async (productId: number) => {
    const response = await api.get(`/products/${productId}/variants`);
    return response.data;
  },

  /**
   * Search products by name
   * @param query - Search query
   * @param params - Additional query parameters
   */
  search: async (
    query: string,
    params?: ProductParams,
  ): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>("/products", {
      params: { search: query, ...params },
    });
    return response.data;
  },

  /**
   * Filter products by price range
   * @param minPrice - Minimum price
   * @param maxPrice - Maximum price
   * @param params - Additional query parameters
   */
  filterByPrice: async (
    minPrice: number,
    maxPrice: number,
    params?: ProductParams,
  ): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>("/products", {
      params: { min_price: minPrice, max_price: maxPrice, ...params },
    });
    return response.data;
  },

  /**
   * Check if product is in stock
   * @param product - Product object
   */
  isInStock: (product: Product): boolean => {
    return product.status === 1 && product.quantity > 0;
  },

  /**
   * Get stock status text
   * @param product - Product object
   */
  getStockStatus: (product: Product): string => {
    if (product.status !== 1) {
      return "Not Available";
    }

    if (product.quantity === 0) {
      return "Out of Stock";
    }

    if (product.quantity < 10) {
      return `Only ${product.quantity} left`;
    }

    return "In Stock";
  },

  /**
   * Calculate discount percentage if applicable
   * @param originalPrice - Original price
   * @param salePrice - Sale price
   */
  calculateDiscount: (originalPrice: number, salePrice: number): number => {
    if (originalPrice <= salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  },

  /**
   * Format product price
   * @param price - Price to format
   * @param currency - Currency symbol (default: ₹)
   */
  formatPrice: (price: number, currency = "₹"): string => {
    return `${currency}${price.toFixed(2)}`;
  },
};
