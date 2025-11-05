

import api from "@/lib/axios";


export type SliderApiItem = {
  id: number;
  title: string | null;
  description?: string | null;
  is_active: boolean;
  main_image_url: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};


export type SliderListParams = {
  active?: boolean;
  limit?: number;
  order?: "asc" | "desc";
};


export type SliderListResponse = {
  data: SliderApiItem[];
};

export type SliderShowResponse = {
  data: SliderApiItem;
};


export async function listSliders(
  params?: SliderListParams,
): Promise<SliderApiItem[]> {
  const { data } = await api.get<SliderListResponse>("/sliders", {
    params,
  });
  return data.data;
}


export async function getSlider(id: number): Promise<SliderApiItem> {
  const { data } = await api.get<SliderShowResponse>(`/sliders/${id}`);
  return data.data;
}


export function getSlidersSWRKey(params?: SliderListParams) {
  
  return ["/sliders", params ?? {}] as const;
}


export function getSliderSWRKey(id?: number) {
  return id ? [`/sliders/${id}`] : null;
}
