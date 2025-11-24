import api from "./http-client";

export interface ShippingAddress {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  post_office_name?: string | null;
  post_office_branch_type?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShippingAddressPayload {
  name: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  post_office_name?: string;
  post_office_branch_type?: string;
  is_default?: boolean;
}

export interface UpdateShippingAddressPayload
  extends Partial<CreateShippingAddressPayload> {}

export const shippingAddressService = {
  async index() {
    return await api.get<{ addresses: ShippingAddress[] }>(
      "/shipping-addresses",
    );
  },

  async store(payload: CreateShippingAddressPayload) {
    return await api.post<{ address: ShippingAddress }>(
      "/shipping-addresses",
      payload,
    );
  },

  async show(id: number) {
    return await api.get<{ address: ShippingAddress }>(
      `/shipping-addresses/${id}`,
    );
  },

  async update(id: number, payload: UpdateShippingAddressPayload) {
    return await api.put<{ address: ShippingAddress }>(
      `/shipping-addresses/${id}`,
      payload,
    );
  },

  async destroy(id: number) {
    return await api.delete(`/shipping-addresses/${id}`);
  },

  async setDefault(id: number) {
    return await api.post<{ address: ShippingAddress }>(
      `/shipping-addresses/${id}/set-default`,
    );
  },
};
