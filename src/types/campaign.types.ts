export interface Campaign {
  id: number;
  name: string;
  description: string;
  type: string;
  target_amount?: number;
  raised_amount?: number;
  thumbnail_url?: string;
  image_urls?: string;
  status: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  slug: string;
  location?: {
    id: number;
    name: string;
  };
}

export interface CampaignsResponse {
  success: boolean;
  message: string;
  data: {
    campaigns: Campaign[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface CampaignResponse {
  success: boolean;
  message: string;
  data: {
    campaign: Campaign;
  };
}

export interface DirectOrderRequest {
  item_type: "campaign";
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
  payment_method: "razorpay";
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

export interface CampaignStats {
  total_donations: number;
  donor_count: number;
  progress_percentage: number;
  days_remaining?: number;
}

export type CampaignType = "feed" | "protect" | "plant";

export interface CampaignLocation {
  id: number;
  name: string;
}

export interface CampaignListItem {
  id: number;
  name: string;
  description: string;
  amount: number;
  raised_amount: number;
  end_date?: string;
  image?: string;
  status: number;
  location?: CampaignLocation;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CampaignListPayload {
  campaigns: CampaignListItem[];
}

export interface CampaignListResponse {
  success: boolean;
  message: string;
  data: CampaignListPayload;
}

export interface CampaignDonor {
  donor_name: string;
  amount: string;
}

export interface CampaignDetailPayload {
  campaign: CampaignListItem;
}

export interface CampaignDetailResponse {
  success: boolean;
  message: string;
  data: CampaignDetailPayload;
}
