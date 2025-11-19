import api from "./http-client";

export const sliderService = {
  async list(params: Record<string, any>) {
    return api.get<any[]>("/sliders", { params });
  }
};