import api from "@/lib/axios";
import type { TreeCollectionResponse, TreeResponse } from "@/types/tree.types";

export const treeService = {
  async getTrees( params: {
    user_lat: number;
    user_lng: number;
    radius_km?: number;
    per_page?: number;
    page?: number;
    type?: string;
  } ): Promise<TreeCollectionResponse> {
    const { data } = await api.get( "/trees", { params } );
    return data;
  },

  async getTree( slug: string ): Promise<TreeResponse> {
    const { data } = await api.get( `/trees/${ slug }` );
    return data;
  }
};