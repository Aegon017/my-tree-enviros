export interface BaseMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
