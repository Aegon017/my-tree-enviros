import api from "./http-client";

export const productService = {
  async list(params: Record<string, any>) {
    return api.get<{ products: any[]; meta: any }>("/products", { params });
  },

  getCategories: () => api.get<{ categories: any[] }>("/categories"),

  getProductBySlug: (slug: string) => api.get<{ product: any }>(`/products/${slug}`),

  getReviewsBySlug: (slug: string, page = 1) => api.get<any>(`/products/${slug}/reviews`, { params: { page } }),

  canReviewBySlug: (slug: string) => api.get<any>(`/products/${slug}/can-review`),

  variants: (productId: string) => api.get<any>(`/products/${productId}/variants`),

  featured: (limit = 10) => api.get<any>("/products/featured", { params: { limit } }),

  byCategory: (categoryId: string, params: Record<string, any> = {}) => api.get<any>(`/products/by-category/${categoryId}`, { params }),

  search: (query: string) => api.get<any>("/products/search", { params: { query } }),
};