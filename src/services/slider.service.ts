

// import api from "@/lib/axios";


// export type SliderApiItem = {
//   id: number;
//   title: string | null;
//   description?: string | null;
//   is_active: boolean;
//   main_image_url: string | null;
//   created_at?: string | null;
//   updated_at?: string | null;
// };


// export type SliderListParams = {
//   active?: boolean;
//   limit?: number;
//   order?: "asc" | "desc";
// };


// export type SliderListResponse = {
//   data: SliderApiItem[];
// };

// export type SliderShowResponse = {
//   data: SliderApiItem;
// };


// export async function listSliders(
//   params?: SliderListParams,
// ): Promise<SliderApiItem[]> {
//   const { data } = await api.get<SliderListResponse>("/sliders", {
//     params,
//   });
//   return data.data;
// }


// export async function getSlider(id: number): Promise<SliderApiItem> {
//   const { data } = await api.get<SliderShowResponse>(`/sliders/${id}`);
//   return data.data;
// }


// export function getSlidersSWRKey(params?: SliderListParams) {

//   return ["/sliders", params ?? {}] as const;
// }


// export function getSliderSWRKey(id?: number) {
//   return id ? [`/sliders/${id}`] : null;
// }

import { fetchJson } from "@/lib/fetch-json";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const sliderService = {
  async list( params: Record<string, any> ) {
    const query = new URLSearchParams( params ).toString();
    return fetchJson( `${ API_BASE }/sliders?${ query }` );
  }
};