
export interface CartItem {
  id: number;
  user_id: number;
  type: number;
  product_type: number;
  product_id: number;
  quantity: number;
  duration?: number;
  coupon_code: string | null;
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

export interface CartResponse {
  success: boolean;
  message: string;
  data: CartItem[];
}

export interface AddToCartPayload {
  type: number; 
  product_type: number; 
  quantity: number;
  duration?: number;
  name?: string;
  occasion?: string;
  message?: string;
  location_id?: number;
  product_variant_id?: number;
  item_type?: string; 
}

export interface AddTreeToCartPayload {
  
  tree_instance_id?: number;
  tree_id?: number;
  location_id?: number;

  
  tree_plan_price_id: number;

  
  quantity?: number;

  
  name?: string;
  occasion?: string;
  message?: string;
}

export interface AddCampaignToCartPayload {
  campaign_id: number;
  amount?: number;
  quantity?: number;
}

export interface UpdateCartItemPayload {
  quantity?: number;
  duration?: number;
  name?: string;
  occasion?: string;
  message?: string;
  location_id?: number;
}

export interface SyncCartPayload {
  items: Array<{
    product_id: number;
    type: number;
    product_type: number;
    quantity: number;
    duration?: number;
    name?: string;
    occasion?: string;
    message?: string;
    location_id?: number;
  }>;
}


export interface BackendCartItem {
  id: number;
  user_id: number;
  type: number;
  product_type: number;
  product_id: number;
  quantity: number;
  duration?: number;
  coupon_code?: string;
  name?: string;
  occasion?: string;
  message?: string;
  location_id?: number;
  cart_id?: number;
  price: number | string;
  item_type?: string;
  item?: any;
  metadata?: any;
}


export interface BackendCartResponse {
  id: number;
  user_id: number;
  total_amount: number;
  total_items: number;
  items: BackendCartItem[];
  created_at: string;
  updated_at: string;
}