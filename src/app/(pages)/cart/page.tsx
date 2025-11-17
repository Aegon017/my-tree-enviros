"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cartService } from "@/services/cart.service";
import type { CartItem } from "@/types/cart.type";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";

const detailsSchema = z.object({
  name: z.string().min(1, "Name is required."),
  occasion: z.string().min(1, "Occasion is required."),
  message: z.string().min(1, "Message is required."),
});

type DetailsFormValues = z.infer<typeof detailsSchema>;

const MAX_DURATION = 50;
const MIN_QUANTITY = 1;

function AddDetailModal({
  open,
  onClose,
  item,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  item: CartItem | null;
  onSave: (
    cartItemId: number,
    details: {
      name: string;
      occasion: string;
      message: string;
    }
  ) => Promise<void>;
}) {
  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      name: "",
      occasion: "",
      message: "",
    },
  });

  useEffect(() => {
    if (open && item) {
      // Use dedication data from API response
      form.reset({
        name: item.dedication?.name || "",
        occasion: item.dedication?.occasion || "",
        message: item.dedication?.message || "",
      });
    }
  }, [open, item, form]);

  const onSubmit = (values: DetailsFormValues) => {
    if (!item) return;
    onSave(item.id, {
      name: values.name,
      occasion: values.occasion,
      message: values.message,
    }).then(() => onClose());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Details</DialogTitle>
          <DialogDescription>Please provide the necessary details for your order.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 grow overflow-hidden flex flex-col">
            <ScrollArea className="grow pr-4">
              <div className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="occasion" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occasion*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter occasion" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Message*</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter special message" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </ScrollArea>

            <div className="flex space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>Save Details</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CartItemComponent({
  item,
  isUpdating,
  onUpdateItem,
  onRemoveItem,
  onOpenDetailModal,
}: {
  item: CartItem;
  isUpdating: boolean;
  onUpdateItem: (cartId: number, params: { quantity?: number; duration?: number }) => void;
  onRemoveItem: (itemId: number) => void;
  onOpenDetailModal: (item: CartItem) => void;
}) {
  // Helper function to get display name based on item type
  const getDisplayName = useCallback(() => {
    if (item.type === 'product') {
      return item.name;
    }
    return item.tree?.name || 'Tree';
  }, [item]);

  // Helper function to get image URL based on item type
  const getImageUrl = useCallback(() => {
    if (item.type === 'product') {
      return item.image_url || '/placeholder-image.jpg';
    }
    // For tree items, you might want to use a default tree image
    // or get from tree data if available in API
    return item.image_url || '/default-tree.jpg';
  }, [item]);

  // Helper function to get duration for tree items
  const getDuration = useCallback(() => {
    if (item.type === 'product') {
      return null;
    }
    return item.plan?.duration || item.duration || MIN_QUANTITY;
  }, [item]);

  const handleQuantityChange = useCallback((newQ: number) => {
    onUpdateItem(item.id, { quantity: Math.max(MIN_QUANTITY, newQ) });
  }, [onUpdateItem, item.id]);

  const handleDurationChange = useCallback((newD: number) => {
    onUpdateItem(item.id, { duration: Math.max(MIN_QUANTITY, Math.min(MAX_DURATION, newD)) });
  }, [onUpdateItem, item.id]);

  const handleInputChange = useCallback((field: "quantity" | "duration") => (value: number) => {
    const clamped = Math.max(MIN_QUANTITY, field === "duration" ? Math.min(MAX_DURATION, value) : value);
    onUpdateItem(item.id, { [field]: clamped });
  }, [onUpdateItem, item.id]);

  const duration = getDuration();
  const displayName = getDisplayName();
  const imageUrl = getImageUrl();

  return (
    <Card className="mb-4 border border-border rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-4 md:gap-6">
          <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-md overflow-hidden shrink-0">
            <Image 
              src={imageUrl} 
              alt={displayName} 
              fill 
              className="object-cover transition-transform duration-300 hover:scale-105" 
              sizes="(max-width: 768px) 80px, 96px" 
              priority 
            />
          </div>

          <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
            <div>
              <h3 className="font-semibold text-base md:text-lg truncate">{displayName}</h3>
              {/* Show variant details for products */}
              {item.type === 'product' && item.variant && (
                <div className="text-sm text-muted-foreground mt-1">
                  {[item.variant.color, item.variant.size, item.variant.planter]
                    .filter(Boolean)
                    .join(' • ')}
                </div>
              )}
              {/* Show plan duration for tree items */}
              {item.type !== 'product' && item.plan && (
                <div className="text-sm text-muted-foreground mt-1">
                  {item.plan.duration} month plan
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground">Quantity</label>
                <div className="flex items-center border border-input rounded-md bg-background">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-none hover:bg-accent transition-colors" onClick={() => handleQuantityChange(item.quantity - 1)} disabled={item.quantity <= MIN_QUANTITY || isUpdating}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input type="number" min={MIN_QUANTITY} value={item.quantity} onChange={(e) => handleInputChange("quantity")(parseInt(e.target.value) || MIN_QUANTITY)} className="w-12 text-center border-x-0 bg-transparent focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" disabled={isUpdating} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-none hover:bg-accent transition-colors" onClick={() => handleQuantityChange(item.quantity + 1)} disabled={isUpdating}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {duration !== null && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">Duration</label>
                  <div className="flex items-center border border-input rounded-md bg-background">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-none hover:bg-accent transition-colors" onClick={() => handleDurationChange(duration - 1)} disabled={duration <= MIN_QUANTITY || isUpdating}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input type="number" min={MIN_QUANTITY} max={MAX_DURATION} value={duration} onChange={(e) => handleInputChange("duration")(parseInt(e.target.value) || MIN_QUANTITY)} className="w-12 text-center border-x-0 bg-transparent focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" disabled={isUpdating} />
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-none hover:bg-accent transition-colors" onClick={() => handleDurationChange(duration + 1)} disabled={duration >= MAX_DURATION || isUpdating}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {item.type !== 'product' && (
              <div className="space-y-3 md:space-y-4">
                <Button variant="outline" size="sm" onClick={() => onOpenDetailModal(item)} className="hover:bg-accent hover:text-accent-foreground transition-colors">
                  {item.dedication?.name ? 'Edit Details' : 'Add Details'}
                </Button>
                {item.dedication && (
                  <div className="text-sm space-y-1 text-foreground">
                    {item.dedication.name && <p><span className="font-medium">Name:</span> {item.dedication.name}</p>}
                    {item.dedication.occasion && <p><span className="font-medium">Occasion:</span> {item.dedication.occasion}</p>}
                    {item.dedication.message && <p><span className="font-medium">Message:</span> {item.dedication.message}</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3 md:gap-4">
            <p className="text-lg md:text-xl font-bold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
            <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} disabled={isUpdating} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderSummary({ subtotal, onClearCart, isClearing }: { subtotal: number; onClearCart: () => Promise<void>; isClearing: boolean }) {
  return (
    <Card className="sticky top-20">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-4 border-t">
            <span>Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
        </div>
        <Link href="/checkout">
          <Button className="w-full mt-4" size="lg">Place Order</Button>
        </Link>
        <Button variant="outline" className="w-full mt-3" onClick={onClearCart} disabled={isClearing}>
          {isClearing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Clear Cart
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-12">
      <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-6">Add some products and trees to get started</p>
      <Button asChild>
        <Link href="/store">Continue Shopping</Link>
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="container mx-auto p-6 text-center">
      <p>Failed to load cart</p>
      <Button className="mt-4" onClick={onRetry}>Retry</Button>
    </div>
  );
}

export default function CartPage() {
  const [cartData, setCartData] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [isClearing, setIsClearing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await cartService.get();
      const cart = res.data?.data.cart;
      setCartData(cart?.items || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const wrapAsync = useCallback(async (itemId: number, fn: () => Promise<void>) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await fn();
      await fetchCart();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingItems((prev) => {
        const s = new Set(prev);
        s.delete(itemId);
        return s;
      });
    }
  }, [fetchCart]);

  const handleUpdateItem = useCallback(async (cartId: number, params: { quantity?: number; duration?: number }) => {
    const item = cartData.find((i) => i.id === cartId);
    if (!item) return;
    await wrapAsync(cartId, async () => {
      const payload: any = {};
      if (typeof params.quantity !== "undefined") payload.quantity = params.quantity;
      if (typeof params.duration !== "undefined") payload.duration = params.duration;
      await api.put(`/cart/items/${item.id}`, payload);
    });
  }, [cartData, wrapAsync]);

  const handleRemoveItem = useCallback(async (itemId: number) => {
    const item = cartData.find((i) => i.id === itemId);
    if (!item) return;
    await wrapAsync(itemId, async () => {
      await cartService.remove(item.id);
    });
  }, [cartData, wrapAsync]);

  const handleUpdateDetails = useCallback(async (cartId: number, details: { name: string; occasion: string; message: string; }) => {
    const item = cartData.find((i) => i.id === cartId);
    if (!item) return;
    await wrapAsync(cartId, async () => {
      await api.put(`/cart/items/${item.id}`, {
        dedication: { name: details.name, occasion: details.occasion, message: details.message },
      });
    });
  }, [cartData, wrapAsync]);

  const handleClearCart = useCallback(async () => {
    setIsClearing(true);
    try {
      await cartService.clear();
      setCartData([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearing(false);
      await fetchCart();
    }
  }, [fetchCart]);

  const subtotal = useMemo(() => cartData.reduce((sum, item) => {
    const p = typeof item.price === "number" ? item.price : parseFloat(item.price as string) || 0;
    return sum + p * item.quantity;
  }, 0), [cartData]);

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;
  if (loading) return <LoadingState />;

  return (
    <div className="container mx-auto py-16 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {!mounted ? <LoadingState /> : cartData.length === 0 ? <EmptyCart /> : (
        <div className="lg:grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {cartData.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                isUpdating={updatingItems.has(item.id)}
                onUpdateItem={handleUpdateItem}
                onRemoveItem={handleRemoveItem}
                onOpenDetailModal={(it) => { setSelectedItem(it); setDetailModalOpen(true); }}
              />
            ))}
          </div>

          <div className="lg:col-span-4">
            <OrderSummary subtotal={subtotal} onClearCart={handleClearCart} isClearing={isClearing} />
          </div>
        </div>
      )}

      <AddDetailModal open={detailModalOpen} onClose={() => { setDetailModalOpen(false); setSelectedItem(null); }} item={selectedItem} onSave={handleUpdateDetails} />
    </div>
  );
}