import api from "@/lib/axios";

/**
 * Blog API Service
 * Uses backend endpoints:
 * - GET /blogs
 * - GET /blogs/{id}
 *
 * For listings, use: thumbnail_url, short_description, created_at
 * For details, use all fields.
 */

/**
 * DTO for a single blog item from the backend.
 * Mirrors App\Http\Resources\Api\V1\BlogResource
 */
export type BlogApiItem = {
  id: number;
  blog_category_id: number | null;
  blog_category?: {
    id: number;
    name: string;
  } | null;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * Query parameters for listing blogs
 */
export type BlogListParams = {
  search?: string;
  category_id?: number;
  sort_by?: "created_at" | "title";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

/**
 * Meta information for paginated responses
 */
export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

/**
 * API response shapes
 */
export type BlogListApiResponse = {
  success: boolean;
  message: string;
  data: {
    blogs: BlogApiItem[];
    meta: PaginationMeta;
  };
};

export type BlogShowApiResponse = {
  success: boolean;
  message: string;
  data: {
    blog: BlogApiItem;
  };
};

/**
 * List blogs with pagination and optional filters.
 * Returns items and meta separately for convenience.
 */
export async function listBlogs(
  params?: BlogListParams,
): Promise<{ items: BlogApiItem[]; meta: PaginationMeta }> {
  const { data } = await api.get<BlogListApiResponse>("/blogs", { params });
  return {
    items: data.data.blogs ?? [],
    meta: data.data.meta,
  };
}

/**
 * Get full details for a single blog by ID.
 */
export async function getBlog(id: number): Promise<BlogApiItem> {
  const { data } = await api.get<BlogShowApiResponse>(`/blogs/${id}`);
  return data.data.blog;
}

/**
 * SWR helper keys (optional)
 */
export function getBlogsSWRKey(params?: BlogListParams) {
  return ["/blogs", params ?? {}] as const;
}

export function getBlogSWRKey(id?: number) {
  return id ? [`/blogs/${id}`] : null;
}
