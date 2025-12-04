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

const formatCurrency = (val?: number | string) => {
  if (val == null) return "₹0.00";
  const num = typeof val === "string" ? Number(val) : val;
  return `₹${num.toFixed(2)}`;
};

const formatDate = (date?: string) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
};

const OrderStatusBadge = ({ status }: { status?: string }) => {
  const s = (status || "").toLowerCase();
  const variant =
    s === "paid"
      ? "default"
      : s === "pending"
        ? "secondary"
        : s === "failed"
          ? "destructive"
          : "secondary";
  return <Badge variant={variant}>{status || "Unknown"}</Badge>;
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
  order: any;
}) => {
  if (!open || !order) return null;

  const payment = order.payment;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-md max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Order {order.reference_number}</CardTitle>
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
                  <OrderStatusBadge status={order.status} />
                </p>
                <p>
                  <strong>Total: </strong>
                  {formatCurrency(order.grand_total)}
                </p>
                <p>
                  <strong>Payment Method: </strong>
                  {payment?.method || "N/A"}
                </p>
                <p>
                  <strong>Transaction ID: </strong>
                  {payment?.transaction_id || "N/A"}
                </p>
              </div>

              {order.shipping_address && (
                <div className="space-y-1">
                  <p className="font-medium">Shipping Address</p>
                  <p>{order.shipping_address.name}</p>
                  <p>{order.shipping_address.phone}</p>
                  <p>
                    {order.shipping_address.address_line_1},{" "}
                    {order.shipping_address.address_line_2}
                  </p>
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state},{" "}
                    {order.shipping_address.postal_code},{" "}
                    {order.shipping_address.country}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Items</h3>
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 border rounded-md"
                >
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    <ShoppingCart className="text-muted-foreground" />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">
                      {item.tree_name || item.type || "Item"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(item.total_amount)}
                    </p>
                  </div>
                </div>
              ))}
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
  const [orders, setOrders] = useState<any[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await orderService.getOrders();
      const data = res.data ?? [];

      const list = Array.isArray(data) ? data : (data as any).orders ?? [];

      setOrders(
        list.map((o: any) => ({
          id: o.id,
          reference_number: o.reference_number,
          status: o.status,
          created_at: o.created_at,
          total: o.grand_total,
        }))
      );
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const openOrderDetails = useCallback(async (id: number) => {
    try {
      const res = await orderService.getOrderById(id);
      const orderData = res.data;
      setOrderDetails(orderData);
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
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Your recent orders</CardDescription>
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
                title="No orders found"
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
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md hover:bg-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-md">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                      </div>

                      <div>
                        <p className="font-medium">
                          Order #{o.reference_number}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(o.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-semibold">{formatCurrency(o.total)}</p>

                      <OrderStatusBadge status={o.status} />

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
