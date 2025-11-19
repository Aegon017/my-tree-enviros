import { fetchJson } from "@/lib/fetch-json";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL;

function url( path: string ) {
  return `${ API_BASE }${ path }`;
}

export const productService = {
  list( params: Record<string, any> ) {
    const q = new URLSearchParams( params ).toString();
    return fetchJson( url( `/products?${ q }` ) );
  },

  getCategories() {
    return fetchJson( url( `/product-categories` ) ).then( ( r ) => r.data.categories );
  },

  getProductBySlug( slug: string ) {
    return fetchJson( url( `/products/${ slug }` ) ).then( ( r ) => r.data.product );
  },

  getReviewsBySlug( slug: string, page = 1 ) {
    return fetchJson( url( `/products/${ slug }/reviews?page=${ page }` ) );
  },

  canReviewBySlug( slug: string ) {
    return fetchJson( url( `/products/${ slug }/can-review` ) );
  },
};