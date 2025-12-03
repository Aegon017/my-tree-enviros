"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Eye,
  ShoppingCart,
  X,
  User as UserIcon,
} from "lucide-react";
import { ordersService as orderService } from "@/modules/orders/services/orders.service";

type OrderLite = {
  id: number;
  order_number?: string;
  created_at?: string;
  status?: string;
  status_label?: string;
  formatted_total?: string;
  total_amount?: number;
};

type OrderDetails = {
  id: number;
  order_number?: string;
  created_at?: string;
  status?: string;
  status_label?: string;
  total_amount?: number;
  formatted_total?: string;
  items?: Array<{
    id: number;
    quantity: number;
    formatted_price?: string;
    formatted_subtotal?: string;
    item?: {
      type?: "tree" | "product" | "campaign";
      name?: string;
      sku?: string | null;
      image?: string | null;
      color?: string | null;
      size?: string | null;
      plan?: {
        name?: string | null;
        type?: string | null;
        duration?: number | null;
      } | null;
      location?: unknown;
    };
  }>;
  shipping_address?: {
    id: number;
    name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  } | null;
  coupon?: {
    id: number;
    code: string;
    type: string;
    value: number | string;
  } | null;
};

const formatCurrency = (val?: number | string) => {
  if (val == null) return "₹0.00";
  if (typeof val === "string") return val;
  return `₹${Number(val).toFixed(2)}`;
};

const formatDate = (date?: string) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
};

const OrderStatusBadge = ({
  status,
  label,
}: {
  status?: string;
  label?: string;
}) => {
  const text = label || status || "Unknown";
  const variant = useMemo(() => {
    const s = (status || "").toLowerCase();
    if (["completed", "delivered"].includes(s)) return "default" as const;
    if (["cancelled", "canceled"].includes(s)) return "destructive" as const;
    if (["pending", "processing", "shipped"].includes(s))
      return "secondary" as const;
    return "secondary" as const;
  }, [status]);
  return <Badge variant={variant}>{text}</Badge>;
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="text-center py-10">
    <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{description}</p>
    {action}
  </div>
);

const OrderDetailsModal = ({
  open,
  onClose,
  order,
}: {
  open: boolean;
  onClose: () => void;
  order: OrderDetails | null;
}) => {
  if (!open || !order) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-md max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Order {order.order_number || order.id}</CardTitle>
                <CardDescription>
                  Placed on {formatDate(order.created_at)}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <strong>Status: </strong>
                  <OrderStatusBadge
                    status={order.status}
                    label={order.status_label}
                  />
                </p>
                <p>
                  <strong>Total: </strong>
                  {order.formatted_total || formatCurrency(order.total_amount)}
                </p>
              </div>
              {order.shipping_address && (
                <div className="space-y-1">
                  <p className="font-medium">Shipping Address</p>
                  <p>{order.shipping_address.name}</p>
                  <p>{order.shipping_address.phone}</p>
                  <p>
                    {[
                      order.shipping_address.address_line_1,
                      order.shipping_address.address_line_2,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state} -{" "}
                    {order.shipping_address.postal_code},{" "}
                    {order.shipping_address.country}
                  </p>
                </div>
              )}
            </div>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Items</h3>
              {!order.items || order.items.length === 0 ? (
                <p className="text-muted-foreground">
                  No items found for this order.
                </p>
              ) : (
                order.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-4 p-3 border rounded-md"
                  >
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {it.item?.image ? (
                        <img
                          src={it.item?.image}
                          alt={it.item?.name || "Item"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {it.item?.name || "Item"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {it.quantity}{" "}
                        {it.item?.sku ? ` • SKU: ${it.item.sku}` : ""}
                        {it.item?.color ? ` • Color: ${it.item.color}` : ""}
                        {it.item?.size ? ` • Size: ${it.item.size}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {it.formatted_subtotal || it.formatted_price || "—"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function OrdersPage() {
  const { token } = useAuthStore();
  const isAuthenticated = !!token;

  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await orderService.getOrders();
      const list = res.data?.orders ?? [];
      setOrders(
        list.map((o: any) => ({
          id: o.id,
          order_number: o.order_number ?? o.order_ref ?? String(o.id),
          created_at: o.created_at,
          status: o.status,
          status_label: o.status_label ?? o.order_status,
          formatted_total:
            o.formatted_total ??
            (o.amount ? formatCurrency(o.amount) : undefined),
          total_amount: o.total_amount ?? o.amount,
        })),
      );
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const openOrderDetails = useCallback(async (id: number) => {
    try {
      const res = await orderService.getOrderById(id);
      const o = res.data?.order as any;
      setOrderDetails({
        id: o.id,
        order_number: o.order_number ?? String(o.id),
        created_at: o.created_at,
        status: o.status,
        status_label: o.status_label,
        total_amount: o.total_amount,
        formatted_total: o.formatted_total,
        items: o.items,
        shipping_address: o.shipping_address ?? null,
        coupon: o.coupon ?? null,
      });
      setDetailsOpen(true);
    } catch { }
  }, []);

  const closeOrderDetails = useCallback(() => {
    setDetailsOpen(false);
    setOrderDetails(null);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, loadOrders]);

  if (!isAuthenticated) {
    return (
      <Section>
        <EmptyState
          icon={UserIcon}
          title="Please sign in"
          description="You need to be signed in to view your orders."
          action={
            <Button asChild>
              <a href="/sign-in">Go to Sign In</a>
            </Button>
          }
        />
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle
        title="My Orders"
        align="center"
        subtitle="View your recent orders and their status."
      />
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View your recent orders
                </CardDescription>
              </div>
              <Button variant="outline" onClick={loadOrders}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex justify-center items-center py-8">
                <p>Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="No orders yet"
                description="You haven't placed any orders yet."
                action={
                  <Button asChild>
                    <a href="/store">Start Shopping</a>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md hover:bg-accent/50 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-md">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Order #{o.order_number || o.id}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(o.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                      <div className="text-right">
                        <p className="font-semibold">
                          {o.formatted_total ||
                            formatCurrency(o.total_amount)}
                        </p>
                      </div>
                      <OrderStatusBadge
                        status={o.status}
                        label={o.status_label}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openOrderDetails(o.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <OrderDetailsModal
        open={detailsOpen}
        onClose={closeOrderDetails}
        order={orderDetails}
      />
    </Section>
  );
}
