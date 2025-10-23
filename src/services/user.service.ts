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

/**
 * User Service for managing user profile and data
 * All endpoints require authentication
 */
export const userService = {
  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>("/me");
    return response.data;
  },

  /**
   * Get all users (admin only)
   * @param params - Query parameters for filtering and pagination
   */
  getUsers: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>("/users", { params });
    return response.data;
  },

  /**
   * Get user by ID (admin only)
   * @param userId - User ID
   */
  getUserById: async (userId: number): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user profile
   * @param userId - User ID
   * @param payload - User data to update
   */
  updateUser: async (
    userId: number,
    payload: UpdateUserPayload,
  ): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/users/${userId}`, payload);
    return response.data;
  },

  /**
   * Update current user's profile
   * @param payload - User data to update
   */
  updateCurrentUser: async (
    payload: UpdateUserPayload,
  ): Promise<UserResponse> => {
    // First get current user to get their ID
    const currentUser = await userService.getCurrentUser();
    return userService.updateUser(currentUser.data.user.id, payload);
  },

  /**
   * Delete user (admin only)
   * @param userId - User ID
   */
  deleteUser: async (userId: number): Promise<{ success: boolean }> => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  /**
   * Create new user (admin only)
   * @param payload - User data
   */
  createUser: async (payload: CreateUserPayload): Promise<UserResponse> => {
    const response = await api.post<UserResponse>("/users", payload);
    return response.data;
  },

  /**
   * Get user's shipping addresses
   */
  getShippingAddresses: async (): Promise<ShippingAddressesResponse> => {
    const response = await api.get<ShippingAddressesResponse>(
      "/shipping-addresses",
    );
    return response.data;
  },

  /**
   * Get shipping address by ID
   * @param addressId - Address ID
   */
  getShippingAddress: async (
    addressId: number,
  ): Promise<ShippingAddressResponse> => {
    const response = await api.get<ShippingAddressResponse>(
      `/shipping-addresses/${addressId}`,
    );
    return response.data;
  },

  /**
   * Create new shipping address
   * @param payload - Address data
   */
  createShippingAddress: async (
    payload: CreateShippingAddressPayload,
  ): Promise<ShippingAddressResponse> => {
    const response = await api.post<ShippingAddressResponse>(
      "/shipping-addresses",
      payload,
    );
    return response.data;
  },

  /**
   * Update shipping address
   * @param addressId - Address ID
   * @param payload - Address data to update
   */
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

  /**
   * Delete shipping address
   * @param addressId - Address ID
   */
  deleteShippingAddress: async (
    addressId: number,
  ): Promise<{ success: boolean }> => {
    const response = await api.delete(`/shipping-addresses/${addressId}`);
    return response.data;
  },

  /**
   * Set address as default
   * @param addressId - Address ID
   */
  setDefaultAddress: async (
    addressId: number,
  ): Promise<ShippingAddressResponse> => {
    const response = await api.post<ShippingAddressResponse>(
      `/shipping-addresses/${addressId}/set-default`,
    );
    return response.data;
  },

  /**
   * Format user's full name
   * @param user - User object
   */
  getFullName: (user: User): string => {
    return user.name || "User";
  },

  /**
   * Check if user's email is verified
   * @param user - User object
   */
  isEmailVerified: (user: User): boolean => {
    return !!user.email_verified_at;
  },

  /**
   * Check if user's mobile is verified
   * @param user - User object
   */
  isMobileVerified: (user: User): boolean => {
    return !!user.mobile_verified_at;
  },

  /**
   * Format user's join date
   * @param user - User object
   */
  getJoinDate: (user: User): string => {
    const date = new Date(user.created_at);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  /**
   * Mask user's email for privacy
   * @param email - Email address
   */
  maskEmail: (email: string): string => {
    const [local, domain] = email.split("@");
    if (local.length <= 3) {
      return `${local.charAt(0)}***@${domain}`;
    }
    return `${local.substring(0, 3)}***@${domain}`;
  },

  /**
   * Mask user's mobile for privacy
   * @param mobile - Mobile number
   */
  maskMobile: (mobile: string): string => {
    if (mobile.length <= 4) {
      return `***${mobile.slice(-2)}`;
    }
    return `******${mobile.slice(-4)}`;
  },

  /**
   * Validate Indian mobile number
   * @param mobile - Mobile number
   */
  isValidMobile: (mobile: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  },

  /**
   * Validate email address
   * @param email - Email address
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Format shipping address for display
   * @param address - Shipping address object
   */
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

  /**
   * Get address label for display
   * @param address - Shipping address object
   */
  getAddressLabel: (address: ShippingAddress): string => {
    return `${address.name} - ${address.city}${address.is_default ? " (Default)" : ""}`;
  },
};
