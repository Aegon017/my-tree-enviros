export type CampaignType = "feed" | "protect" | "plant";

export interface CampaignLocation {
  id: number;
  name: string;
  parent_id: number | null;
  is_active: boolean;
  depth?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Campaign {
  id: number;
  location_id: number;
  type: CampaignType | null;
  type_label?: string | null;
  name: string;
  slug: string;
  description: string | null;
  amount: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  main_image_url?: string | null;
  thumbnail_url?: string | null;
  image_urls?: string[];
  location?: CampaignLocation | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface CampaignListPayload {
  campaigns: Campaign[];
  meta: PaginationMeta;
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

export interface CampaignStats {
  raised_amount: number;
  pending_amount: number;
  target_amount: number | null;
}

export interface CampaignDetailPayload {
  campaign: Campaign;
  stats?: CampaignStats;
  donors?: CampaignDonor[];
}

export interface CampaignDetailResponse {
  success: boolean;
  message: string;
  data: CampaignDetailPayload;
}

import type { FeedTree } from "./feed-tree";

export interface LegacyCampaignDetailData {
  campaign_id: number;
  title: string;
  campaign_details: FeedTree;
  raised_amount: number;
  pending_amount: number;
  target_amount: number | null;
  donors: CampaignDonor[];
}

export interface LegacyCampaignDetailResponse {
  status: boolean;
  message: string;
  data: LegacyCampaignDetailData;
}

export type AnyCampaignDetailResponse =
  | CampaignDetailResponse
  | LegacyCampaignDetailResponse;
