/**
 * Campaign types and API response shapes used by the Feed-a-Tree pages.
 *
 * This file provides two groups of types:
 * 1) New Campaign API shapes (from /api/v1/campaigns)
 * 2) Legacy "Feed Tree" campaign detail shape used by the current pages
 *
 * You can migrate progressively by typing to the New API first,
 * while keeping the Legacy types for the detail page until it switches.
 */

/* =========================
 * New Campaign API (v1)
 * ========================= */

export type CampaignType = "feed" | "protect" | "plant";

export interface CampaignLocation {
  id: number;
  name: string;
  parent_id: number | null;
  is_active: boolean;
  // Optional fields exposed by the backend resource
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
  amount: number | null; // suggested/default contribution amount

  start_date: string | null; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
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
  amount: string; // string to preserve formatting from API; parseFloat when needed
}

export interface CampaignStats {
  raised_amount: number; // total raised so far
  pending_amount: number; // remaining to target
  target_amount: number | null; // campaign goal (if any)
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

/* ======================================
 * Legacy Feed-Tree Campaign detail shape
 * ======================================
 *
 * The existing Feed-a-Tree detail page uses an older response format:
 * {
 *   status: boolean,
 *   message: string,
 *   data: {
 *     campaign_id: number,
 *     title: string,
 *     campaign_details: FeedTree,
 *     raised_amount: number,
 *     pending_amount: number,
 *     target_amount: number | null,
 *     donors: { donor_name: string; amount: string }[]
 *   }
 * }
 *
 * Until the page migrates fully to the new Campaign endpoints,
 * keep these types available for compatibility.
 */

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

/**
 * Union for handling either the new or legacy campaign detail responses.
 */
export type AnyCampaignDetailResponse =
  | CampaignDetailResponse
  | LegacyCampaignDetailResponse;
