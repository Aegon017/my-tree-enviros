import api from "@/lib/axios";
import type { TreeCollectionResponse, TreeResponse } from "@/types/tree.types";

export const treeService = {
  async getSponsorTrees( params: {
    user_lat: number;
    user_lng: number;
    radius_km?: number;
    per_page?: number;
    page?: number;
  } ): Promise<TreeCollectionResponse> {
    const { data } = await api.get( `/trees/sponsor`, { params } );
    return data;
  },

  async getSponsorTree( slug: string ): Promise<TreeResponse> {
    const { data } = await api.get( `/trees/sponsor/${ slug }` );
    return data;
  },

  async getAdoptTrees( params: {
    user_lat: number;
    user_lng: number;
    radius_km?: number;
    per_page?: number;
    page?: number;
  } ): Promise<TreeCollectionResponse> {
    const { data } = await api.get( `/trees/adopt`, { params } );
    return data;
  },

  async getAdoptTree( slug: string ): Promise<TreeResponse> {
    const { data } = await api.get( `/trees/adopt/${ slug }` );
    return data;
  },
};