// import api from "@/lib/axios";
// import { BlogCollectionData, BlogCollectionResponse, BlogParams, BlogResponse, BlogSingleData } from "@/types/blog.types";

// export async function listBlogs( params?: BlogParams ): Promise<BlogCollectionData> {
//   const res = await api.get<BlogCollectionResponse>( "/blogs", { params } );
//   return res.data.data;
// }

// export async function getBlog( slug: string ): Promise<BlogSingleData> {
//   const res = await api.get<BlogResponse>( `/blogs/${ slug }` );
//   return res.data.data;
// }

import { fetchJson } from "@/lib/fetch-json";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const blogService = {
  async list( params: Record<string, any> ) {
    const query = new URLSearchParams( params ).toString();
    return fetchJson( `${ API_BASE }/blogs?${ query }` );
  }
};