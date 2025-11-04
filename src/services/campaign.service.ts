// Campaign service for direct payment operations
import api from '@/lib/axios';
import { authStorage } from '@/lib/auth-storage';

export interface DirectOrderRequest {
  item_type: 'campaign';
  campaign_id: number;
  amount: number;
  quantity?: number;
  name?: string;
  occasion?: string;
  message?: string;
  location_id?: number;
  coupon_id?: number;
  shipping_address_id?: number;
}

export interface PaymentInitiateRequest {
  payment_method: 'razorpay';
}

export interface PaymentVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface OrderResponse {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  type: string;
  items: any[];
}

export interface PaymentInitiateResponse {
  razorpay_order_id: string;
  amount: number;
  amount_rupees: number;
  currency: string;
  order_number: string;
  key: string;
}

export interface PaymentVerifyResponse {
  order: OrderResponse;
  payment_id: string;
}

class CampaignService {
  /**
   * Create a direct order for campaign contribution
   */
  async createDirectOrder(request: DirectOrderRequest): Promise<{ order: OrderResponse }> {
    // Require authentication for all direct payment operations
    if (!authStorage.isAuthenticated()) {
      window.location.href = '/sign-in';
      throw new Error('Authentication required');
    }

    const response = await api.post<{
      success: boolean;
      message: string;
      data: { order: OrderResponse }
    }>('/orders/direct', request);

    return { order: response.data.data.order };
  }

  /**
   * Initiate payment for an order
   */
  async initiatePayment(orderId: string, request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    // Require authentication for payment operations
    if (!authStorage.isAuthenticated()) {
      window.location.href = '/sign-in';
      throw new Error('Authentication required');
    }

    const response = await api.post<{
      success: boolean;
      message: string;
      data: PaymentInitiateResponse;
    }>(`/orders/${orderId}/payment/initiate`, request);

    return response.data.data;
  }

  /**
   * Verify payment and complete order
   */
  async verifyPayment(orderId: string, request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    // Require authentication for payment operations
    if (!authStorage.isAuthenticated()) {
      window.location.href = '/sign-in';
      throw new Error('Authentication required');
    }

    const response = await api.post<{
      success: boolean;
      message: string;
      data: PaymentVerifyResponse;
    }>(`/orders/${orderId}/payment/verify`, request);

    return response.data.data;
  }

  /**
   * Get payment status for an order
   */
  async getPaymentStatus(orderId: string): Promise<{
    order_id: number;
    order_number: string;
    order_status: string;
    order_status_label: string;
    payment?: {
      id: number;
      amount: number;
      payment_method: string;
      transaction_id: string;
      status: string;
      paid_at: string;
    };
  }> {
    // Require authentication for payment status
    if (!authStorage.isAuthenticated()) {
      window.location.href = '/sign-in';
      throw new Error('Authentication required');
    }

    const response = await api.get<{
      success: boolean;
      message: string;
      data: any;
    }>(`/orders/${orderId}/payment/status`);

    return response.data.data;
  }
}

export const campaignService = new CampaignService();