import { fetchJson } from "@/lib/fetch-json";

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const blogService = {
  async get( slug: string ) {
    return fetchJson( `${ API }/blogs/${ slug }` );
  },

  async list( params: Record<string, any> ) {
    const query = new URLSearchParams( params ).toString();
    return fetchJson( `${ API }/blogs?${ query }` );
  }
};