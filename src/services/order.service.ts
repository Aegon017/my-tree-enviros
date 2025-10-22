"use client";

import api from "@/lib/axios";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_type: number; // 1 = tree, 2 = ecom product
  type: number; // 1 = sponsor, 2 = adopt
  quantity: number;
  duration?: number;
  price: number;
  name?: string;
  occasion?: string;
  message?: string;
  location_id?: number;
  ecom_product?: {
    id: number;
    name: string;
    price: number;
    main_image_url?: string;
  };
  product?: {
    id: number;
    name: string;
    main_image_url?: string;
    price: Array<{
      duration: number;
      price: string;
    }>;
  };
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
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_status: string; // pending, completed, failed, refunded
  order_status: string; // pending, processing, completed, cancelled
  payment_method?: string;
  transaction_id?: string;
  shipping_address_id?: number;
  shipping_address?: ShippingAddress;
  coupon_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
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

export interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
  };
}

export interface CreateOrderPayload {
  shipping_address_id?: number;
  coupon_code?: string;
  notes?: string;
  cart_type?: number; // 1 = cart, 2 = direct
}

export interface CreateDirectOrderPayload {
  product_id: number;
  product_type: number; // 1 = tree, 2 = ecom product
  type: number; // 1 = sponsor, 2 = adopt
  quantity: number;
  duration?: number;
  shipping_address_id?: number;
  coupon_code?: string;
  name?: string;
  occasion?: string;
  message?: string;
  location_id?: number;
}

export interface MyTreesResponse {
  success: boolean;
  message: string;
  data: {
    sponsored: Order[];
    adopted: Order[];
  };
}

export interface OrderParams {
  status?: string;
  payment_status?: string;
  from_date?: string;
  to_date?: string;
  per_page?: number;
  page?: number;
}

/**
 * Order Service for managing orders and payments
 * All endpoints are protected and require authentication
 */
export const orderService = {
  /**
   * Get all orders for the authenticated user
   * @param params - Query parameters for filtering and pagination
   */
  getOrders: async (params?: OrderParams): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>("/v1/orders", { params });
    return response.data;
  },

  /**
   * Get a specific order by ID
   * @param orderId - Order ID
   */
  getOrderById: async (orderId: number): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>(`/v1/orders/${orderId}`);
    return response.data;
  },

  /**
   * Create order from cart
   * @param payload - Order creation details
   */
  createOrder: async (payload: CreateOrderPayload): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>("/v1/orders", payload);
    return response.data;
  },

  /**
   * Create direct order (buy now without cart)
   * @param payload - Direct order details
   */
  createDirectOrder: async (
    payload: CreateDirectOrderPayload,
  ): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>(
      "/v1/orders/direct",
      payload,
    );
    return response.data;
  },

  /**
   * Cancel an order
   * @param orderId - Order ID
   */
  cancelOrder: async (orderId: number): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>(
      `/v1/orders/${orderId}/cancel`,
    );
    return response.data;
  },

  /**
   * Get user's trees (sponsored and adopted)
   */
  getMyTrees: async (): Promise<MyTreesResponse> => {
    const response = await api.get<MyTreesResponse>("/v1/my-trees");
    return response.data;
  },

  /**
   * Initiate Razorpay payment for an order
   * @param orderId - Order ID
   */
  initiatePayment: async (orderId: number) => {
    const response = await api.post(
      `/v1/orders/${orderId}/payment/initiate`,
    );
    return response.data;
  },

  /**
   * Verify Razorpay payment
   * @param orderId - Order ID
   * @param paymentData - Payment verification data from Razorpay
   */
  verifyPayment: async (
    orderId: number,
    paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) => {
    const response = await api.post(
      `/v1/orders/${orderId}/payment/verify`,
      paymentData,
    );
    return response.data;
  },

  /**
   * Get payment status for an order
   * @param orderId - Order ID
   */
  getPaymentStatus: async (orderId: number) => {
    const response = await api.get(`/v1/orders/${orderId}/payment/status`);
    return response.data;
  },

  /**
   * Calculate order total
   * @param items - Order items
   */
  calculateTotal: (items: OrderItem[]): number => {
    return items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  },

  /**
   * Get order status display text
   * @param status - Order status
   */
  getOrderStatusText: (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      cancelled: "Cancelled",
      shipped: "Shipped",
      delivered: "Delivered",
    };

    return statusMap[status.toLowerCase()] || status;
  },

  /**
   * Get payment status display text
   * @param status - Payment status
   */
  getPaymentStatusText: (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: "Pending",
      completed: "Completed",
      failed: "Failed",
      refunded: "Refunded",
    };

    return statusMap[status.toLowerCase()] || status;
  },

  /**
   * Get order status color
   * @param status - Order status
   */
  getOrderStatusColor: (status: string): string => {
    const colorMap: Record<string, string> = {
      pending: "orange",
      processing: "blue",
      completed: "green",
      cancelled: "red",
      shipped: "purple",
      delivered: "green",
    };

    return colorMap[status.toLowerCase()] || "gray";
  },

  /**
   * Check if order can be cancelled
   * @param order - Order object
   */
  canBeCancelled: (order: Order): boolean => {
    const cancellableStatuses = ["pending", "processing"];
    return cancellableStatuses.includes(order.order_status.toLowerCase());
  },

  /**
   * Format order date
   * @param dateString - Date string
   */
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  /**
   * Format order time
   * @param dateString - Date string
   */
  formatTime: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },
};
