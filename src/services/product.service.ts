import { fetchJson } from "@/lib/fetch-json";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const productService = {
  async list( params: Record<string, any> ) {
    const query = new URLSearchParams( params ).toString();
    return fetchJson( `${ API_BASE }/products?${ query }` );
  },

  async getCategories() {
    const res = await fetchJson( `${ API_BASE }/product-categories` );
    return res.data.categories;
  }
};