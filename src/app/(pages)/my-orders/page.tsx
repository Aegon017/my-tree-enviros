"use client";

import { useEffect, useState } from "react";
import { Package, Calendar, CreditCard, MapPin, Eye, X } from "lucide-react";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import {
  orderService,
  type Order,
  type OrderItem,
} from "@/services/order.services";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";

const MyOrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await orderService.getOrders();
        if (response.success && response.data) {
          setOrders(response.data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setCancellingOrderId(orderId);

    try {
      const response = await orderService.cancelOrder(orderId);
      if (response.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: "cancelled" } : order,
          ),
        );
        toast.success("Order cancelled successfully");
        setIsDetailOpen(false);
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error("Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "secondary",
      processing: "default",
      completed: "outline",
      cancelled: "destructive",
      shipped: "default",
      delivered: "outline",
    };

    return statusColors[status.toLowerCase()] || "default";
  };

  const getPaymentStatusColor = (status: string) => {
    const statusColors: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "secondary",
      completed: "outline",
      failed: "destructive",
      refunded: "secondary",
    };

    return statusColors[status.toLowerCase()] || "default";
  };

  if (isLoading) {
    return (
      <Section>
        <SectionTitle
          title="My Orders"
          align="center"
          subtitle="Loading your orders..."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={`order-skeleton-${index}`}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <SectionTitle
          title="My Orders"
          align="center"
          subtitle="Your order history"
        />
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to load orders</h3>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Section>
    );
  }

  if (orders.length === 0) {
    return (
      <Section>
        <SectionTitle
          title="My Orders"
          align="center"
          subtitle="Your order history"
        />
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-4">
            Start shopping to see your orders here!
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/sponsor-a-tree")}>
              Browse Trees
            </Button>
            <Button variant="outline" onClick={() => router.push("/store")}>
              Browse Products
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle
        title="My Orders"
        align="center"
        subtitle={`You have ${orders.length} order${orders.length !== 1 ? "s" : ""}`}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    Order #{order.reference_number}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {orderService.formatDate(order.created_at)}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge variant={getStatusColor(order.status)}>
                    {orderService.getOrderStatusText(order.status)}
                  </Badge>
                  <Badge
                    variant={getPaymentStatusColor(
                      order.paid_at ? "completed" : "pending",
                    )}
                  >
                    {orderService.getPaymentStatusText(
                      undefined,
                      order.paid_at,
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{order.items.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">₹{order.total.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Final Amount</span>
                  <span className="font-bold text-lg text-primary">
                    ₹{order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => handleViewDetails(order)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              {orderService.canBeCancelled(order) && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleCancelOrder(order.id)}
                  disabled={cancellingOrderId === order.id}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.reference_number}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {}
              <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                <div>
                  <p className="text-sm text-muted-foreground">Order Status</p>
                  <p className="font-semibold">
                    {orderService.getOrderStatusText(selectedOrder.status)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Status
                  </p>
                  <p className="font-semibold">
                    {orderService.getPaymentStatusText(
                      undefined,
                      selectedOrder.paid_at,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-semibold">
                    {orderService.formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>

              {}
              <div>
                <h3 className="font-semibold text-lg mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: OrderItem) => {
                    const productName =
                      item.tree_instance?.tree?.name ||
                      item.plan_price?.plan?.name ||
                      (item as any).item?.name ||
                      "Item";

                    const productImage =
                      item.tree_instance?.tree?.image_url ||
                      (item as any).item?.image ||
                      null;

                    const isTree =
                      item.type === "sponsor" ||
                      item.type === "adopt" ||
                      item.type === "tree";
                    const isProduct = item.type === "product";

                    const displayPrice = (item.total_amount ??
                      item.amount * item.quantity) as number;

                    return (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="relative w-20 h-20 shrink-0">
                              {productImage ? (
                                <Image
                                  src={productImage}
                                  alt={productName || "Product"}
                                  fill
                                  className="object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                                  <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{productName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">
                                  {isTree
                                    ? "Tree"
                                    : isProduct
                                      ? "Product"
                                      : "Other"}
                                </Badge>
                                {item.type === "sponsor" && (
                                  <Badge variant="secondary">Sponsor</Badge>
                                )}
                                {item.type === "adopt" && (
                                  <Badge variant="secondary">Adopt</Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-muted-foreground">
                                  Qty: {item.quantity}
                                </span>
                                <span className="font-semibold">
                                  ₹{displayPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {}
              {selectedOrder.shipping_address && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </h3>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-semibold">
                        {selectedOrder.shipping_address.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.shipping_address.phone}
                      </p>
                      <p className="text-sm mt-2">
                        {selectedOrder.shipping_address.address_line1}
                      </p>
                      {selectedOrder.shipping_address.address_line2 && (
                        <p className="text-sm">
                          {selectedOrder.shipping_address.address_line2}
                        </p>
                      )}
                      <p className="text-sm">
                        {selectedOrder.shipping_address.city},{" "}
                        {selectedOrder.shipping_address.state}{" "}
                        {selectedOrder.shipping_address.pincode}
                      </p>
                      <p className="text-sm">
                        {selectedOrder.shipping_address.country}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{selectedOrder.total.toFixed(2)}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex items-center justify-between text-green-600">
                          <span>Discount</span>
                          <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      {selectedOrder.coupon?.code && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Coupon</span>
                          <Badge variant="secondary">
                            {selectedOrder.coupon.code}
                          </Badge>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between font-bold text-lg">
                        <span>Total Paid</span>
                        <span className="text-primary">
                          ₹{selectedOrder.total.toFixed(2)}
                        </span>
                      </div>
                      {(selectedOrder as any).transaction_id && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Transaction ID
                          </span>
                          <span className="font-mono text-xs">
                            {(selectedOrder as any).transaction_id}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {}
              <div className="flex gap-2 justify-end pt-4">
                {orderService.canBeCancelled(selectedOrder) && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    disabled={cancellingOrderId === selectedOrder.id}
                  >
                    {cancellingOrderId === selectedOrder.id
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
};

export default MyOrdersPage;
