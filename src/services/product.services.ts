import { fetchJson } from "@/lib/fetch-json";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL;

function url( path: string ) {
  return `${ API_BASE }${ path }`;
}

export const productService = {
  async list( params: Record<string, any> ) {
    const q = new URLSearchParams( params ).toString();
    const res = await fetchJson( url( `/products?${ q }` ) );
    return res.data;
  },

  async getCategories() {
    const res = await fetchJson( url( `/product-categories` ) );
    return res.data?.categories ?? [];
  },

  async getProductBySlug( slug: string ) {
    const res = await fetchJson( url( `/products/${ slug }` ) );
    return res.data?.product ?? null;
  },

  async getReviewsBySlug( slug: string, page = 1 ) {
    const res = await fetchJson( url( `/products/${ slug }/reviews?page=${ page }` ) );
    return res.data;
  },

  async canReviewBySlug( slug: string ) {
    const res = await fetchJson( url( `/products/${ slug }/can-review` ) );
    return res.data;
  },

  async variants( productId: string ) {
    const res = await fetchJson( url( `/products/${ productId }/variants` ) );
    return res.data;
  },

  async featured( limit = 10 ) {
    const res = await fetchJson( url( `/products/featured?limit=${ limit }` ) );
    return res.data;
  },

  async byCategory( categoryId: string, params: Record<string, any> = {} ) {
    const q = new URLSearchParams( params ).toString();
    const res = await fetchJson( url( `/products/by-category/${ categoryId }?${ q }` ) );
    return res.data;
  },
};