"use client";

import api from "@/lib/axios";

export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  email_verified_at?: string;
  mobile_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    meta?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
    };
  };
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  mobile?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  mobile: string;
  password?: string;
}

export interface ShippingAddress {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddressesResponse {
  success: boolean;
  message: string;
  data: ShippingAddress[];
}

export interface ShippingAddressResponse {
  success: boolean;
  message: string;
  data: {
    address: ShippingAddress;
  };
}

export interface CreateShippingAddressPayload {
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default?: boolean;
}


export const userService = {
  
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>("/me");
    return response.data;
  },

  
  getUsers: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>("/users", { params });
    return response.data;
  },

  
  getUserById: async (userId: number): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/${userId}`);
    return response.data;
  },

  
  updateUser: async (
    userId: number,
    payload: UpdateUserPayload,
  ): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/users/${userId}`, payload);
    return response.data;
  },

  
  updateCurrentUser: async (
    payload: UpdateUserPayload,
  ): Promise<UserResponse> => {
    
    const currentUser = await userService.getCurrentUser();
    return userService.updateUser(currentUser.data.user.id, payload);
  },

  
  deleteUser: async (userId: number): Promise<{ success: boolean }> => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  
  createUser: async (payload: CreateUserPayload): Promise<UserResponse> => {
    const response = await api.post<UserResponse>("/users", payload);
    return response.data;
  },

  
  getShippingAddresses: async (): Promise<ShippingAddressesResponse> => {
    const response = await api.get<ShippingAddressesResponse>(
      "/shipping-addresses",
    );
    return response.data;
  },

  
  getShippingAddress: async (
    addressId: number,
  ): Promise<ShippingAddressResponse> => {
    const response = await api.get<ShippingAddressResponse>(
      `/shipping-addresses/${addressId}`,
    );
    return response.data;
  },

  
  createShippingAddress: async (
    payload: CreateShippingAddressPayload,
  ): Promise<ShippingAddressResponse> => {
    const response = await api.post<ShippingAddressResponse>(
      "/shipping-addresses",
      payload,
    );
    return response.data;
  },

  
  updateShippingAddress: async (
    addressId: number,
    payload: Partial<CreateShippingAddressPayload>,
  ): Promise<ShippingAddressResponse> => {
    const response = await api.put<ShippingAddressResponse>(
      `/shipping-addresses/${addressId}`,
      payload,
    );
    return response.data;
  },

  
  deleteShippingAddress: async (
    addressId: number,
  ): Promise<{ success: boolean }> => {
    const response = await api.delete(`/shipping-addresses/${addressId}`);
    return response.data;
  },

  
  setDefaultAddress: async (
    addressId: number,
  ): Promise<ShippingAddressResponse> => {
    const response = await api.post<ShippingAddressResponse>(
      `/shipping-addresses/${addressId}/set-default`,
    );
    return response.data;
  },

  
  getFullName: (user: User): string => {
    return user.name || "User";
  },

  
  isEmailVerified: (user: User): boolean => {
    return !!user.email_verified_at;
  },

  
  isMobileVerified: (user: User): boolean => {
    return !!user.mobile_verified_at;
  },

  
  getJoinDate: (user: User): string => {
    const date = new Date(user.created_at);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  
  maskEmail: (email: string): string => {
    const [local, domain] = email.split("@");
    if (local.length <= 3) {
      return `${local.charAt(0)}***@${domain}`;
    }
    return `${local.substring(0, 3)}***@${domain}`;
  },

  
  maskMobile: (mobile: string): string => {
    if (mobile.length <= 4) {
      return `***${mobile.slice(-2)}`;
    }
    return `******${mobile.slice(-4)}`;
  },

  
  isValidMobile: (mobile: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  },

  
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  
  formatAddress: (address: ShippingAddress): string => {
    const parts = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.pincode,
      address.country,
    ].filter(Boolean);

    return parts.join(", ");
  },

  
  getAddressLabel: (address: ShippingAddress): string => {
    return `${address.name} - ${address.city}${address.is_default ? " (Default)" : ""}`;
  },
};
