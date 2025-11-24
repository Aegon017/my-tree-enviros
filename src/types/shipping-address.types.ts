export interface ShippingAddress {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  post_office_name: string;
  post_office_branch_type: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
