import api from "./http-client";
import type {
  ShippingAddress,
  CreateShippingAddressPayload,
  UpdateShippingAddressPayload,
} from "./shipping-address.services";

export type UserType = "individual" | "organization";

export interface User {
  id: number;
  type: UserType;
  name: string | null;
  email: string | null;
  country_code: string;
  phone: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserPayload {
  type?: UserType;
  name?: string;
  email?: string;
  country_code?: string;
  phone?: string;
}

export const userService = {
  async getUsers(params?: { page?: number }) {
    return await api.get<{ users: User[]; meta: any }>("/users", { params });
  },

  async getUserById(id: number) {
    return await api.get<{ user: User }>(`/users/${id}`);
  },

  async updateUser(id: number, payload: UpdateUserPayload) {
    return await api.put<{ user: User }>(`/users/${id}`, payload);
  },

  async deleteUser(id: number) {
    return await api.delete(`/users/${id}`);
  },

  // Current user methods
  async getCurrentUser() {
    return await api.get<{ user: User }>("/me");
  },

  async updateCurrentUser(payload: UpdateUserPayload) {
    return await api.put<{ user: User }>("/me", payload);
  },

  // Shipping address methods (delegating to shipping address service)
  async getShippingAddresses() {
    return await api.get<{ addresses: ShippingAddress[] }>(
      "/shipping-addresses",
    );
  },

  async createShippingAddress(payload: CreateShippingAddressPayload) {
    return await api.post<{ address: ShippingAddress }>(
      "/shipping-addresses",
      payload,
    );
  },

  async updateShippingAddress(
    id: number,
    payload: UpdateShippingAddressPayload,
  ) {
    return await api.put<{ address: ShippingAddress }>(
      `/shipping-addresses/${id}`,
      payload,
    );
  },

  async deleteShippingAddress(id: number) {
    return await api.delete(`/shipping-addresses/${id}`);
  },

  async setDefaultAddress(id: number) {
    return await api.post<{ address: ShippingAddress }>(
      `/shipping-addresses/${id}/set-default`,
    );
  },
};
