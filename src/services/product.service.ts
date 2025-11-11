import api from "@/lib/axios";
import {
  Product,
  Meta,
  ProductParams,
  ProductsApiResponse,
  ProductCategory,
  ProductCategoriesResponse,
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
    const { data } = await api.get<{ data: { product: Product } }>(
      `${ baseUrl }/products/${ slug }`
    );
    return data.data.product;
  },

  async getProducts( params: ProductParams ): Promise<{ products: Product[]; meta: Meta }> {
    const query = buildQuery( params );
    const res = await fetch( `${ baseUrl }/products?${ query }`, { cache: "no-store" } );
    const data: ProductsApiResponse = await res.json();
    if ( !data.success ) throw new Error( data.message );
    return { products: data.data.products, meta: data.data.meta };
  },

  async getCategories(): Promise<ProductCategory[]> {
    const res = await fetch( `${ baseUrl }/product-categories`, { cache: "no-store" } );
    const data: ProductCategoriesResponse = await res.json();
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