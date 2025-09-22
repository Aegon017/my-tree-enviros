"use client";

import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import useSWR from "swr";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { storage } from "@/lib/storage";
import type { CartItem } from "@/types/cart";

interface CartResponse {
  status: boolean;
  data: CartItem[];
}

const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${storage.getToken()}` },
  }).then((res) => res.json());

export default function CartPage() {
  const { data, error, isLoading, mutate } = useSWR<CartResponse>(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cart`,
    fetcher,
  );

  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  const updateCartItem = useCallback(
    async (productId: number, params: CartItem) => {
      setUpdatingItems((prev) => new Set(prev).add(productId));
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cart/add/${productId}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${storage.getToken()}`,
            },
            body: JSON.stringify(params),
          },
        );
        mutate();
      } catch (error) {
        console.error("Failed to update cart:", error);
      } finally {
        setUpdatingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    },
    [mutate],
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cart/remove/${itemId}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${storage.getToken()}`,
            },
          },
        );
        mutate();
      } catch (error) {
        console.error("Failed to remove item:", error);
      } finally {
        setUpdatingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    },
    [mutate],
  );

  if (error)
    return <div className="container mx-auto p-6">Failed to load cart</div>;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const cartItems = data?.data || [];
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.ecom_product.price * item.quantity,
    0,
  );

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-6xl min-h-screen">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some plants to get started
            </p>
            <Button>Continue Shopping</Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              {cartItems.map((item) => {
                const isUpdating = updatingItems.has(item.ecom_product.id);
                const cartParams = {
                  quantity: item.quantity,
                  type: item.type || 2,
                  product_type: item.product_type || 2,
                  duration: item.duration || 1,
                  name: item.name || "Customer",
                  occasion: item.occasion || "General",
                  message: item.message || "Thank you!",
                  location_id: item.location_id || 1,
                  cart_type: item.cart_type || 1,
                };

                return (
                  <Card key={item.id} className="mb-4">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-6">
                        <div className="relative h-24 w-24 rounded-md overflow-hidden">
                          <Image
                            src={item.ecom_product.main_image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">
                              {item.ecom_product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {item.ecom_product.botanical_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() =>
                                  updateCartItem(item.ecom_product.id, {
                                    ...cartParams,
                                    quantity: Math.max(1, item.quantity - 1),
                                  })
                                }
                                disabled={item.quantity <= 1 || isUpdating}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQuantity = Math.max(
                                    1,
                                    parseInt(e.target.value) || 1,
                                  );
                                  updateCartItem(item.ecom_product.id, {
                                    ...cartParams,
                                    quantity: newQuantity,
                                  });
                                }}
                                className="w-16 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={isUpdating}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() =>
                                  updateCartItem(item.ecom_product.id, {
                                    ...cartParams,
                                    quantity: item.quantity + 1,
                                  })
                                }
                                disabled={isUpdating}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              disabled={isUpdating}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              $
                              {(
                                item.ecom_product.price * item.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="lg:col-span-4">
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-4 border-t">
                      <span>Total</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6" size="lg">
                    Place Order
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
