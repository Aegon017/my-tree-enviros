/* eslint-disable @typescript-eslint/consistent-type-definitions */

import api from "@/lib/axios";

/**
 * API DTO for a Slider item returned by the Laravel backend.
 * Mirrors App\Http\Resources\Api\V1\SliderResource
 */
export type SliderApiItem = {
  id: number;
  title: string | null;
  description?: string | null;
  is_active: boolean;
  main_image_url: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

/**
 * Query params accepted by the sliders index endpoint.
 * - active: filter by active status (defaults to true if omitted)
 * - limit: limit number of items (1-100)
 * - order: sort order by ID (asc|desc, default: desc)
 */
export type SliderListParams = {
  active?: boolean;
  limit?: number;
  order?: "asc" | "desc";
};

/**
 * Default envelope used by Laravel JsonResource collections.
 */
export type SliderListResponse = {
  data: SliderApiItem[];
};

export type SliderShowResponse = {
  data: SliderApiItem;
};

/**
 * Fetch a list of sliders. Active-only by default on the backend.
 * You can override using params.active = false.
 */
export async function listSliders(
  params?: SliderListParams,
): Promise<SliderApiItem[]> {
  const { data } = await api.get<SliderListResponse>("/sliders", {
    params,
  });
  return data.data;
}

/**
 * Fetch a single slider by ID.
 */
export async function getSlider(id: number): Promise<SliderApiItem> {
  const { data } = await api.get<SliderShowResponse>(`/sliders/${id}`);
  return data.data;
}

/**
 * Utility: Build a stable SWR key for sliders list requests (optional helper).
 */
export function getSlidersSWRKey(params?: SliderListParams) {
  // Keep key stable and serializable
  return ["/sliders", params ?? {}] as const;
}

/**
 * Utility: Build a stable SWR key for single slider requests (optional helper).
 */
export function getSliderSWRKey(id?: number) {
  return id ? [`/sliders/${id}`] : null;
}
