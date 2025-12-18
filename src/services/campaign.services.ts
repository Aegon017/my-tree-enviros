import api from "@/services/http-client";
import type {
  CampaignsResponse,
  CampaignResponse,
} from "@/types/campaign.types";
import type { ApiResponse } from "@/services/http-client";

class CampaignService {
  async getAll(params?: {
    location_id?: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<CampaignsResponse>> {
    const response = await api.get<CampaignsResponse>("/campaigns", { params });
    return response;
  }

  async getById(id: string | number): Promise<ApiResponse<CampaignResponse>> {
    const response = await api.get<CampaignResponse>(`/campaigns/${id}`);
    return response;
  }
}

export const campaignService = new CampaignService();
