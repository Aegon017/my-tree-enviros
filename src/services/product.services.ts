import api from "./http-client";

export const productService = {
  async list(params: Record<string, any>) {
    return api.get<{ products: any[]; meta: any }>("/products", { params });
  },

  getCategories: () => api.get<{ categories: any[] }>("/products/categories"),

  getProductBySlug: (slug: string) =>
    api.get<{ product: any }>(`/products/${slug}`),

  getReviewsByProductId: (productId: number) =>
    api.get<any>(`/products/${productId}/reviews`),

  canReviewBySlug: (slug: string) =>
    api.get<any>(`/products/${slug}/can-review`),

  variants: (productId: string) =>
    api.get<any>(`/products/${productId}/variants`),

  featured: (limit = 10) =>
    api.get<any>("/products/featured", { params: { limit } }),

  byCategory: (categoryId: string, params: Record<string, any> = {}) =>
    api.get<any>(`/products/by-category/${categoryId}`, { params }),

  search: (query: string) =>
    api.get<any>("/products/search", { params: { query } }),
};
