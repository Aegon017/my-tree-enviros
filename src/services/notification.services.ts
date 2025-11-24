import api from "@/services/http-client";
import type {
  Notification,
  NotificationResponse,
  ApiResponse,
} from "@/types/notification.types";

export const notificationService = {
  getAll: async (params?: {
    per_page?: number;
    page?: number;
  }): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>("/notifications", {
      params,
    });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Notification>> => {
    const response = await api.get<ApiResponse<Notification>>(
      `/notifications/${id}`,
    );
    return response.data;
  },

  markAsRead: async (id: number): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>("/notifications/mark-all-read");
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/notifications/${id}`);
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get<ApiResponse<{ count: number }>>(
      "/notifications/unread-count",
    );
    return response.data;
  },
};

export async function getNotifications() {
  return notificationService.getAll();
}
