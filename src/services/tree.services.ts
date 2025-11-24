import api from "./http-client";

export const treeService = {
  async list(params: Record<string, any>) {
    return api.get<{ trees: any[] }>("/trees", { params });
  },

  async get(slug: string, type: string) {
    return api.get<{ tree: any }>(`/trees/${slug}`, { params: { type } });
  },
};
