import api from "@/services/http-client";
import type {
  Notification,
  NotificationResponse,
  ApiResponse as ServiceApiResponse,
} from "@/types/notification.types";

export const notificationService = {
  getAll: async (params?: {
    per_page?: number;
    page?: number;
  }): Promise<NotificationResponse> => {
    const response = await api.get<any>("/notifications", { params });
    return {
      status: true,
      message: "Notifications fetched successfully",
      data: response.data || [],
    };
  },

  getById: async (id: string | number): Promise<ServiceApiResponse<Notification>> => {
    const response = await api.get<any>(`/notifications/${id}`);
    return {
      status: true,
      message: "Notification fetched successfully",
      data: response.data,
    };
  },

  markAsRead: async (id: string | number): Promise<ServiceApiResponse> => {
    await api.post("/notifications/read", { ids: [String(id)] });
    return { status: true, message: "Marked as read", data: [] };
  },

  markAllAsRead: async (): Promise<ServiceApiResponse> => {
    await api.post("/notifications/read", { all: true });
    return { status: true, message: "All marked as read", data: [] };
  },

  delete: async (id: string | number): Promise<ServiceApiResponse> => {
    await api.delete(`/notifications/${id}`);
    return { status: true, message: "Notification deleted", data: [] };
  },

  getUnreadCount: async (): Promise<ServiceApiResponse<{ count: number }>> => {
    const response = (await api.get<any>(
      "/notifications/unread-count",
    )) as any;
    return {
      status: true,
      message: "Unread count fetched",
      data: response,
    };
  },

  saveDeviceToken: async (token: string): Promise<ServiceApiResponse> => {
    await api.post("/device-tokens", {
      token,
      platform: "web",
    });
    return { status: true, message: "Device token saved", data: [] };
  },
};

export async function getNotifications() {
  return notificationService.getAll();
}
