// import api from "@/lib/axios";
// import type { TreeCollectionResponse, TreeResponse } from "@/types/tree.types";

// export const treeService = {
//   async getTrees( params: {
//     user_lat: number;
//     user_lng: number;
//     radius_km?: number;
//     per_page?: number;
//     page?: number;
//     type?: string;
//   } ): Promise<TreeCollectionResponse> {
//     const { data } = await api.get( "/trees", { params } );
//     return data;
//   },

//   async getTree( slug: string ): Promise<TreeResponse> {
//     const { data } = await api.get( `/trees/${ slug }` );
//     return data;
//   }
// };

import { fetchJson } from "@/lib/fetch-json";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const treeService = {
  async list( params: Record<string, any> ) {
    const query = new URLSearchParams( params ).toString();
    return fetchJson( `${ API_BASE }/trees?${ query }` );
  }
};