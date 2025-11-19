import api from "./http-client";

export const blogService = {
  async get(slug: string) {
    return api.get<{ blog: any }>(`/blogs/${slug}`);
  },

  async list(params: Record<string, any>) {
    return api.get<{ blogs: any[]; meta: any }>("/blogs", { params });
  }
};