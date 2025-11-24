import { ApiResponse, BaseMeta } from "./common.types";

export type BlogParams = {
  search?: string;
  category_id?: number;
  sort_by?: "created_at" | "title";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export interface Blog {
  id: number;
  slug: string;
  title: string;
  category: BlogCategory;
  short_description: string;
  description?: string;
  thumbnail_url: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogListItem {
  id: number;
  title: string;
  slug: string;
  thumbnail_url: string;
  short_description: string;
  category: BlogCategory;
  created_at: string;
}

export interface BlogCategory {
  id: number;
  name: string;
}

export type BlogCollectionData = {
  blogs: BlogListItem[];
  meta: BaseMeta;
};

export type BlogSingleData = {
  blog: Blog;
};

export type BlogCollectionResponse = ApiResponse<BlogCollectionData>;
export type BlogResponse = ApiResponse<BlogSingleData>;
