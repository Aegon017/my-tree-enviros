import { fetchJson } from "@/lib/fetch-json";

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const treeService = {
  async list( params: Record<string, any> ) {
    const query = new URLSearchParams( params ).toString();
    return fetchJson( `${ API }/trees?${ query }` );
  },

  async get( slug: string, type: string ) {
    return fetchJson( `${ API }/trees/${ slug }?type=${ type }` );
  }
};