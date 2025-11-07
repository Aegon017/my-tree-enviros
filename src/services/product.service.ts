"use client";

import api from "@/lib/axios";
import { Product, ProductParams, ProductResponse, ProductsResponse } from "@/types/product";
import type {
  ProductReview,
  ProductReviewResponse,
  ProductReviewsResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewStats,
  CanReviewResponse,
  ReviewSummary
} from "@/types/product-review.types";

export const productService = {
  getAll: async ( params?: ProductParams ): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>( "/products", {
      params,
    } );
    return response.data;
  },

  getById: async ( id: number ): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>( `/products/${ id }` );
    return response.data;
  },

  getFeatured: async ( limit?: number ): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>( "/products/featured", {
      params: { per_page: limit },
    } );
    return response.data;
  },

  getByCategory: async (
    categoryId: number,
    params?: ProductParams,
  ): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>(
      `/products/category/${ categoryId }`,
      { params },
    );
    return response.data;
  },

  getVariants: async ( productId: number ) => {
    const response = await api.get( `/products/${ productId }/variants` );
    return response.data;
  },

  search: async (
    query: string,
    params?: ProductParams,
  ): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>( "/products", {
      params: { search: query, ...params },
    } );
    return response.data;
  },

  isInStock: ( product: Product ): boolean => {
    return product.status === 1 && product.quantity > 0;
  },

  getStockStatus: ( product: Product ): string => {
    if ( product.status !== 1 ) {
      return "Not Available";
    }

    if ( product.quantity === 0 ) {
      return "Out of Stock";
    }

    if ( product.quantity < 10 ) {
      return `Only ${ product.quantity } left`;
    }

    return "In Stock";
  },

  calculateDiscount: ( originalPrice: number, salePrice: number ): number => {
    if ( originalPrice <= salePrice ) return 0;
    return Math.round( ( ( originalPrice - salePrice ) / originalPrice ) * 100 );
  },

  formatPrice: ( price: number, currency = "₹" ): string => {
    return `${ currency }${ price.toFixed( 2 ) }`;
  },

  
  
  getReviews: async (
    productId: number,
    params?: {
      page?: number;
      per_page?: number;
      sort_by?: "rating" | "created_at";
      sort_order?: "asc" | "desc";
      rating?: number;
    },
  ): Promise<ProductReviewsResponse> => {
    const response = await api.get<ProductReviewsResponse>(
      `/products/${productId}/reviews`,
      { params },
    );
    return response.data;
  },

  
  createReview: async (
    productId: number,
    reviewData: CreateReviewRequest,
  ): Promise<ProductReviewResponse> => {
    const response = await api.post<ProductReviewResponse>(
      `/products/${productId}/reviews`,
      reviewData,
    );
    return response.data;
  },

  
  updateReview: async (
    productId: number,
    reviewId: number,
    reviewData: UpdateReviewRequest,
  ): Promise<ProductReviewResponse> => {
    const response = await api.put<ProductReviewResponse>(
      `/products/${productId}/reviews/${reviewId}`,
      reviewData,
    );
    return response.data;
  },

  
  deleteReview: async (
    productId: number,
    reviewId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/products/${productId}/reviews/${reviewId}`);
    return response.data;
  },

  
  getReviewStats: async (
    productId: number,
  ): Promise<{
    success: boolean;
    data: ReviewStats;
  }> => {
    const response = await api.get<{
      success: boolean;
      data: ReviewStats;
    }>(`/products/${productId}/reviews/stats`);
    return response.data;
  },

  
  canUserReview: async (
    productId: number,
  ): Promise<{
    success: boolean;
    data: CanReviewResponse;
  }> => {
    const response = await api.get<{
      success: boolean;
      data: CanReviewResponse;
    }>(`/products/${productId}/reviews/can-review`);
    return response.data;
  },

  
  markReviewHelpful: async (
    productId: number,
    reviewId: number,
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.post<{
      success: boolean;
      message: string;
    }>(`/products/${productId}/reviews/${reviewId}/helpful`);
    return response.data;
  },

  
  getReviewsSummary: async (
    productId: number,
  ): Promise<{
    success: boolean;
    data: ReviewSummary;
  }> => {
    const response = await api.get<{
      success: boolean;
      data: ReviewSummary;
    }>(`/products/${productId}/reviews/summary`);
    return response.data;
  },
};