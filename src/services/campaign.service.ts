import api from '@/lib/axios';
import { authStorage } from '@/lib/auth-storage';
import type {
  Campaign,
  CampaignsResponse,
  CampaignResponse,
  DirectOrderRequest,
  PaymentInitiateRequest,
  PaymentVerifyRequest,
  OrderResponse,
  PaymentInitiateResponse,
  PaymentVerifyResponse,
  CampaignStats
} from '@/types/campaign.types';

class CampaignService {
  async createDirectOrder(request: DirectOrderRequest): Promise<{ order: OrderResponse }> {
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

  async initiatePayment(orderId: string, request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
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

  async verifyPayment(orderId: string, request: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
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

  async getAll(params?: {
    type?: string;
    status?: number;
    per_page?: number;
    page?: number;
  }): Promise<CampaignsResponse> {
    const response = await api.get<CampaignsResponse>("/campaigns", { params });
    return response.data;
  }

  async getByType(
    type: string,
    params?: {
      per_page?: number;
      page?: number;
    },
  ): Promise<CampaignsResponse> {
    const response = await api.get<CampaignsResponse>("/campaigns", {
      params: { type, ...params },
    });
    return response.data;
  }

  async getById(id: number): Promise<CampaignResponse> {
    const response = await api.get<CampaignResponse>(`/campaigns/${id}`);
    return response.data;
  }

  async getFeatured(limit: number = 10): Promise<CampaignsResponse> {
    const response = await api.get<CampaignsResponse>("/campaigns/featured", {
      params: { per_page: limit },
    });
    return response.data;
  }

  async search(
    query: string,
    params?: {
      type?: string;
      per_page?: number;
      page?: number;
    },
  ): Promise<CampaignsResponse> {
    const response = await api.get<CampaignsResponse>("/campaigns/search", {
      params: { q: query, ...params },
    });
    return response.data;
  }

  async getStats(id: number): Promise<{
    success: boolean;
    data: {
      total_donations: number;
      donor_count: number;
      progress_percentage: number;
      days_remaining?: number;
    };
  }> {
    const response = await api.get<{
      success: boolean;
      data: {
        total_donations: number;
        donor_count: number;
        progress_percentage: number;
        days_remaining?: number;
      };
    }>(`/campaigns/${id}/stats`);
    return response.data;
  }
}

export const campaignService = new CampaignService();