export interface FeedTreeResponse {
  status: boolean;
  message: string;
  data: FeedTree[];
}

export interface FeedTree {
  id: number;
  state_id: number;
  city_id: number;
  area: string;
  type_id: number | null;
  name: string;
  slug: string;
  sku: string;
  description: string;
  goal_amount: string;
  raised_amount: string;
  main_image: string;
  expiration_date: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  trash: number;
  status: number;
  main_image_url: string;
  city: City;
  state: State;
  donations: Donation[];
}

export interface City {
  id: number;
  name: string;
  state_id: number;
  slug: string;
  main_img: string | null;
  status: number;
  trash: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  main_img_url: string;
}

export interface State {
  id: number;
  name: string;
  slug: string;
  main_img: string | null;
  status: number;
  trash: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  main_img_url: string;
}

export interface Donation {
  id: number;
  campaign_id: number;
  amount: string;
  donor_name: string;
  donor_email: string;
  donor_id: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  trash: number;
  status: number;
}
