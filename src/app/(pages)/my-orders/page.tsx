"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import {

  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Eye,
  ShoppingCart,
  X,
  User as UserIcon,
  Package,
  Heart,
  TreeDeciduous,
  Megaphone,
  Filter,
  RefreshCcw,
  ChevronRight,
  MapPin,
  CreditCard,
  Truck,
} from "lucide-react";
import { ordersService as orderService } from "@/modules/orders/services/orders.service";
import Image from "next/image";
import { toast } from "sonner";

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
  const [isDownloading, setIsDownloading] = useState(false);

  if (!open || !order) return null;

  const payment = order.payment;
  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount || 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6 border-b flex items-start justify-between bg-muted/30">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold tracking-tight">
                Order #{order.reference_number}
              </h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Order Items
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 space-y-6">
              <div>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border rounded-xl bg-card hover:bg-accent/10 transition-colors"
                    >
                      <div className="w-20 h-20 bg-muted rounded-lg relative overflow-hidden shrink-0 border">
                        {item.tree_instance?.image_url || item.tree?.image_url || item.product_variant?.image_url || item.campaign_details?.image_url ? (
                          <Image
                            src={item.tree_instance?.image_url || item.tree?.image_url || item.product_variant?.image_url || item.campaign_details?.image_url}
                            alt={item.name || "Item"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                            <TreeDeciduous className="h-8 w-8 opacity-20" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-base">
                              {item.tree?.name || item.product_variant?.product?.name || item.campaign_details?.name || item.type || "Unknown Item"}
                            </h4>
                            <div className="text-sm text-muted-foreground capitalize flex flex-wrap gap-1 items-center">
                              <span>{item.type}</span>
                              {(item.plan_details?.name || item.product_variant?.name || item.plan_price?.name) && (
                                <>
                                  <span>•</span>
                                  <span>{item.plan_details?.name || item.product_variant?.name || item.plan_price?.name}</span>
                                </>
                              )}
                            </div>
                            {item.site_details && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {item.site_details.name || item.site_details.location}
                                {item.site_details.country ? `, ${item.site_details.country}` : ''}
                              </p>
                            )}
                            {item.dedication && (
                              <div className="mt-2 text-sm bg-primary/5 p-2 rounded text-primary-foreground/80">
                                <p className="font-medium text-primary text-xs uppercase tracking-wider mb-0.5">Dedication</p>
                                <p className="text-foreground">{item.dedication.message}</p>
                                <p className="italic text-muted-foreground text-xs mt-0.5">- For {item.dedication.name} ({item.dedication.occasion})</p>
                              </div>
                            )}
                          </div>
                          <p className="font-semibold whitespace-nowrap">
                            {formatCurrency(item.total_amount)}
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 md:col-span-5">
              <Card>
                <CardHeader className="pb-3 bg-muted/30">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    {/* Tax and Shipping Hidden as per request */}
                    {/* <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatCurrency(shipping)}</span>
                    </div> */}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg pt-1">
                      <span>Total</span>
                      <span>{formatCurrency(order.grand_total)}</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="bg-muted p-3 rounded-md text-xs space-y-1">
                      <p><span className="font-medium">Method:</span> {payment?.method || "N/A"}</p>
                      <p><span className="font-medium">Txn ID:</span> {payment?.transaction_id || "N/A"}</p>
                      <p><span className="font-medium">Status:</span> <span className="capitalize">{payment?.status || "Pending"}</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {order.shipping_address && (
                <Card>
                  <CardHeader className="pb-3 bg-muted/30">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Truck className="h-4 w-4" /> Shipping Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 text-sm space-y-2">
                    <p className="font-medium">{order.shipping_address.name}</p>
                    <div className="text-muted-foreground">
                      <p>{order.shipping_address.address}</p>
                      {order.shipping_address.area && <p>{order.shipping_address.area}</p>}
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                      </p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                    <p className="pt-2 flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {order.shipping_address.phone}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 border-t bg-muted/10 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {order.status === 'paid' && (
            <Button
              variant="default"
              disabled={isDownloading}
              onClick={async () => {
                try {
                  setIsDownloading(true);
                  toast.loading("Downloading invoice...", { id: "download-invoice" });

                  const blob = await orderService.downloadInvoice(order.id);
                  const url = window.URL.createObjectURL(blob);

                  toast.dismiss("download-invoice");
                  toast.success("Invoice downloaded! Redirecting...", { id: "redirect-invoice" });

                  window.open(url, "_blank");
                  setTimeout(() => window.URL.revokeObjectURL(url), 100);
                } catch (error) {
                  console.error("Failed to download invoice:", error);
                  toast.error("Failed to download invoice.", { id: "download-invoice" });
                } finally {
                  setIsDownloading(false);
                }
              }}
            >
              {isDownloading ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Download Invoice"
              )}
            </Button>
          )}
        </div>
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
  const [activeTab, setActiveTab] = useState("all");

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await orderService.getOrders({
        type: activeTab !== 'all' ? activeTab : undefined
      });
      const data = res.data ?? [];

      const list = Array.isArray(data) ? data : ((data as any).orders ?? []);

      setOrders(list);
    } finally {
      setOrdersLoading(false);
    }
  }, [activeTab]);

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

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

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

      <div className="max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 overflow-x-auto">
            <TabsTrigger value="all" className="flex-1 min-w-[100px] py-2">All Orders</TabsTrigger>
            <TabsTrigger value="sponsor" className="flex-1 min-w-[100px] py-2 flex items-center gap-2">
              <Heart className="w-4 h-4" /> Sponsor
            </TabsTrigger>
            <TabsTrigger value="adopt" className="flex-1 min-w-[100px] py-2 flex items-center gap-2">
              <TreeDeciduous className="w-4 h-4" /> Adopt
            </TabsTrigger>
            <TabsTrigger value="product" className="flex-1 min-w-[100px] py-2 flex items-center gap-2">
              <Package className="w-4 h-4" /> Products
            </TabsTrigger>
            <TabsTrigger value="campaign" className="flex-1 min-w-[100px] py-2 flex items-center gap-2">
              <Megaphone className="w-4 h-4" /> Campaigns
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {ordersLoading ? (
              <div className="flex flex-col justify-center items-center py-20 bg-muted/10 rounded-xl border border-dashed">
                <RefreshCcw className="h-8 w-8 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground animate-pulse">Fetching your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="No orders found"
                description={activeTab === 'all' ? "You haven't placed any orders yet." : `No ${activeTab} orders found.`}
                action={
                  <Button asChild>
                    <a href="/store">Start Shopping</a>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <Card key={o.id} className="overflow-hidden hover:shadow-md transition-shadow group border-muted">
                    <CardHeader className="bg-muted/30 py-4 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-4">
                        <div className="font-mono font-bold text-lg">#{o.reference_number}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(o.created_at)}
                        </div>
                      </div>
                      <OrderStatusBadge status={o.status} />
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-3">
                          {o.items?.slice(0, 2).map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-center">
                              <div className="w-12 h-12 bg-muted rounded-md relative shrink-0 flex items-center justify-center border">
                                {item.tree_instance?.image_url || item.tree?.image_url || item.product_variant?.image_url || item.campaign_details?.image_url ? (
                                  <Image
                                    src={item.tree_instance?.image_url || item.tree?.image_url || item.product_variant?.image_url || item.campaign_details?.image_url}
                                    alt="Item"
                                    fill
                                    className="object-cover rounded-md"
                                  />
                                ) : (
                                  <TreeDeciduous className="w-6 h-6 text-muted-foreground opacity-50" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium line-clamp-1">{item.tree?.name || item.product_variant?.product?.name || item.campaign_details?.name || item.type}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                          {o.items?.length > 2 && (
                            <p className="text-xs text-muted-foreground pl-1">
                              + {o.items.length - 2} more items...
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col justify-center items-end min-w-[150px] gap-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-xl font-bold">{formatCurrency(o.grand_total)}</p>
                          </div>
                          <Button
                            className="w-full md:w-auto"
                            variant="outline"
                            onClick={() => openOrderDetails(o.id)}
                          >
                            View Details <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </div>

      <OrderDetailsModal
        open={detailsOpen}
        onClose={closeOrderDetails}
        order={orderDetails}
      />
    </Section>
  );
}
