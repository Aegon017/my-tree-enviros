"use client";

import api from "@/lib/axios";
import { Product, ProductParams, ProductResponse, ProductsResponse } from "@/types/product";

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

  filterByPrice: async (
    minPrice: number,
    maxPrice: number,
    params?: ProductParams,
  ): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>( "/products", {
      params: { min_price: minPrice, max_price: maxPrice, ...params },
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
};