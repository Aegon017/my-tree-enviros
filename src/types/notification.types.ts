export interface Notification {
  id: number;
  title: string;
  message: string;
  send_to: string;
  user_ids: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  status: boolean;
  message: string;
  data: Notification[];
}

export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

export interface NotificationStats {
  unread_count: number;
  total_count: number;
}