import api from "@/services/http-client";
import type {
  CampaignsResponse,
  CampaignResponse,
} from "@/types/campaign.types";

class CampaignService {
  async getAll(params?: {
    location_id?: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
  }): Promise<CampaignsResponse> {
    const response = await api.get<CampaignsResponse>("/campaigns", { params });
    return response;
  }

  async getById(id: string | number): Promise<CampaignResponse> {
    const response = await api.get<CampaignResponse>(`/campaigns/${id}`);
    return response;
  }
}

export const campaignService = new CampaignService();
