import { useState, useEffect, useCallback } from "react";
import { ordersService, Order } from "../services/orders.service";
import { toast } from "sonner";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<any>(null);

  const fetchOrders = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const response = await ordersService.getOrders(params);
      if (response.data) {
        setOrders(response.data.orders);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    meta,
    fetchOrders,
  };
}

export function useOrder(orderId: number | string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const response = await ordersService.getOrderById(orderId);
      if (response.data) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error("Failed to fetch order", error);
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    refetch: fetchOrder,
  };
}
