import api from "@/lib/axios";




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


export type BlogListParams = {
  search?: string;
  category_id?: number;
  sort_by?: "created_at" | "title";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
};


export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};


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


export async function listBlogs(
  params?: BlogListParams,
): Promise<{ items: BlogApiItem[]; meta: PaginationMeta }> {
  const { data } = await api.get<BlogListApiResponse>("/blogs", { params });
  return {
    items: data.data.blogs ?? [],
    meta: data.data.meta,
  };
}


export async function getBlog(id: number): Promise<BlogApiItem> {
  const { data } = await api.get<BlogShowApiResponse>(`/blogs/${id}`);
  return data.data.blog;
}


export function getBlogsSWRKey(params?: BlogListParams) {
  return ["/blogs", params ?? {}] as const;
}

export function getBlogSWRKey(id?: number) {
  return id ? [`/blogs/${id}`] : null;
}
