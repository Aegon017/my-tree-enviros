import api from "@/services/http-client";
import { ApiResponse } from "@/services/http-client";

export interface OrderCharge {
  type: "tax" | "shipping" | "fee";
  label: string;
  amount: number;
}

export interface OrderItem {
  id: number;
  type: string;
  quantity: number;
  amount: number;
  total_amount: number;
  tree_instance?: any;
  plan_price?: any;
  item?: any;
  [key: string]: any;
}

export interface Order {
  id: number;
  order_number: string;
  reference_number?: string;
  user_id: number;
  status: string;
  status_label?: string;
  subtotal: number;
  discount: number;
  total: number;
  tax: number;
  shipping: number;
  fee: number;
  grand_total?: number;
  gst_amount?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  formatted_subtotal?: string;
  formatted_discount?: string;
  formatted_total?: string;
  formatted_gst?: string;
  currency: string;
  payment_method?: string;
  paid_at?: string;
  items?: OrderItem[];
  shipping_address?: any;
  coupon?: any;
  charges?: OrderCharge[];
  created_at?: string;
  updated_at?: string;
}

export interface OrdersResponse
  extends ApiResponse<{
    orders: Order[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> { }

export interface OrderResponse
  extends ApiResponse<{
    order: Order;
  }> { }

export const ordersService = {
  async getOrders(params?: any) {
    return await api.get<OrdersResponse["data"]>("/orders", { params });
  },

  async getOrderById(orderId: number | string) {
    return await api.get<OrderResponse["data"]>(`/orders/${orderId}`);
  },

  async downloadInvoice(orderId: number | string) {
    const token = await import("@/lib/auth-storage").then((m) =>
      m.authStorage.getToken(),
    );
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
    const BACKEND_URL = BASE_URL.replace(/\/api\/?$/, "");
    const url = `${BASE_URL}/orders/${orderId}/invoice`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf",
        "X-Platform": "web",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Invoice download failed", {
        status: response.status,
        statusText: response.statusText,
        url,
        errorText
      });
      throw new Error(`Failed to download invoice: ${response.status} ${errorText}`);
    }

    return await response.blob();
  },

  async downloadCreditNote(orderId: number | string) {
    const token = await import("@/lib/auth-storage").then((m) =>
      m.authStorage.getToken(),
    );
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
    const url = `${BASE_URL}/orders/${orderId}/credit-note`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf",
        "X-Platform": "web",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Credit Note download failed", {
        status: response.status,
        statusText: response.statusText,
        url,
        errorText
      });
      throw new Error(`Failed to download credit note: ${response.status} ${errorText}`);
    }

    return await response.blob();
  },

  async cancelOrder(orderId: number, reason: string) {
    return await api.post<{ success: boolean; message: string }>(
      `/orders/${orderId}/cancel`,
      { reason }
    );
  },

  async createDirectOrder(data: any) {
    const items = [
      {
        type: String(data.item_type || data.type || "campaign"),
        campaign_id: data.campaign_id,
        tree_id: data.tree_id,
        plan_id: data.plan_id,
        plan_price_id: data.tree_plan_price_id || data.plan_price_id,
        tree_instance_id: data.tree_instance_id,
        product_variant_id: data.product_variant_id,
        sponsor_quantity: data.sponsor_quantity,
        amount: data.amount,
        quantity: data.quantity || 1,
      },
    ];

    return await api.post<any>("/checkout/prepare", {
      items,
      coupon_code: data.coupon_code,
    });
  },

  async validateCoupon(code: string, amount: number) {
    return await api.post<any>("/checkout/check-coupon", {
      coupon_code: code,
      amount,
    });
  },

  formatDate(dateString: string) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  getOrderStatusText(status: string) {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  },

  getPaymentStatusText(status?: string, paidAt?: string) {
    if (paidAt) return "Paid";
    return status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "Pending";
  },

  canBeCancelled(order: Order) {
    return ["pending", "processing", "paid"].includes(order.status);
  },
};
