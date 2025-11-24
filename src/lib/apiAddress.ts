import api from "@/services/http-client";

export interface ReverseGeocodeResult {
  area?: string;
  city?: string;
  postal_code?: string;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult> {
  const res = await api.get<any>(`/address/reverse-geocode`, {
    params: { lat, lng },
  });
  return res.data?.data ?? res.data;
}

export async function getPostOffices(pincode: string): Promise<any[]> {
  const res = await api.get<any>(`/address/post-offices`, {
    params: { pincode },
  });
  return res.data?.data ?? res.data ?? [];
}

export async function saveShippingAddress(payload: any) {
  const res = await api.post<any>("/shipping-addresses", payload);
  return res.data;
}

export async function listShippingAddresses() {
  const res = await api.get<any>("/shipping-addresses");
  return res.data.addresses ?? res.data.data ?? res.data;
}

export async function deleteShippingAddress(id: number) {
  return api.delete(`/shipping-addresses/${id}`);
}

export async function setDefaultShippingAddress(id: number) {
  const res = await api.post<any>(`/shipping-addresses/${id}/set-default`);
  return res.data;
}
