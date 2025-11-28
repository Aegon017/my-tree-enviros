// ─────────────────────────────────────────────
// ✅ Campaign Types
// ─────────────────────────────────────────────

export type CampaignType = "feed" | "protect" | "plant";

export interface Campaign {
  id: number;
  location_id: number;
  name: string;
  slug: string;
  description?: string | null;
  target_amount: number | null;
  raised_amount: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  thumbnail_url?: string | null;
  image_urls?: string[] | null;
  location?: {
    id: number;
    name: string;
    parent_id: number | null;
    is_active: boolean;
  } | null;

  created_at?: string | null;
  updated_at?: string | null;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
  };
}

export interface CampaignResponse {
  campaign: Campaign;
}

// ─────────────────────────────────────────────
// ✅ Orders & Payment Types
// ─────────────────────────────────────────────

export interface OrderItem {
  id: number;
  type: string;
  amount: number;
  quantity: number;
  total_amount: number;
  [key: string]: any; // fallback for tree/campaign specific fields
}

export interface OrderResponse {
  id: number;
  reference_number: string;
  total: number;
  status: string;
  payment_method?: string;
  items: OrderItem[];
}

// ─────────────────────────────────────────────
// ✅ Direct Campaign Order Request
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// ✅ Payment Initiation
// ─────────────────────────────────────────────

export interface PaymentInitiateRequest {
  payment_method: "razorpay";
}

export interface PaymentInitiateResponse {
  razorpay_order_id: string;
  amount: number; // paise
  amount_rupees: number; // rupees
  currency: string;
  key: string;
  order_number: string; // backend maps to reference_number
}

// ─────────────────────────────────────────────
// ✅ Payment Verification
// ─────────────────────────────────────────────

export interface PaymentVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerifyResponse {
  order: OrderResponse;
  payment_id: string;
}
