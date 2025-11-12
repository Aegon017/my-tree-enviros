import api from "@/lib/axios";
import { ProductCategory } from "@/types/category.types";
import { ApiResponse } from "@/types/common.types";
import {
  ProductParams,
  ProductResponse,
  ProductCollectionResponse,
} from "@/types/product.types";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL as string;

const buildQuery = ( params: ProductParams ) => {
  const query = new URLSearchParams();
  Object.entries( params ).forEach( ( [ k, v ] ) => {
    if ( v !== undefined && v !== null && v !== "" ) query.set( k, String( v ) );
  } );
  return query.toString();
};

export const productService = {
  async getProductBySlug( slug: string ) {
    const { data } = await api.get<ProductResponse>( `${ baseUrl }/products/${ slug }` );
    return data.data.product;
  },

  async getProducts( params: ProductParams ): Promise<ProductCollectionResponse> {
    const query = new URLSearchParams();
    Object.entries( params ).forEach( ( [ k, v ] ) => {
      if ( v !== undefined && v !== null && v !== "" ) query.set( k, String( v ) );
    } );

    const { data } = await api.get<ProductCollectionResponse>(
      `${ baseUrl }/products?${ query.toString() }`
    );

    return data;
  },

  async getCategories() {
    const res = await fetch( `${ baseUrl }/product-categories`, { cache: "no-store" } );
    const data = await res.json();
    if ( !data.success ) throw new Error( data.message );
    return data.data.categories;
  },

  async canReviewBySlug( slug: string ) {
    const { data } = await api.get( `${ baseUrl }/products/${ slug }/can-review` );
    return data;
  },

  async getReviewsBySlug( slug: string, page = 1 ) {
    const { data } = await api.get( `${ baseUrl }/products/${ slug }/reviews?page=${ page }` );
    return data;
  },

  async getRelatedBySlug( slug: string ) {
    const { data } = await api.get( `${ baseUrl }/products/${ slug }/related` );
    return data.data;
  },

  async search( term: string, page = 1 ) {
    const { data } = await api.get( `${ baseUrl }/products?search=${ term }&page=${ page }` );
    return data.data;
  },
};
