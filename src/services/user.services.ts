import api from "./http-client";

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
};
