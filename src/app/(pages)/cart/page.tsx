"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartItem } from "@/domain/cart/cart-item";
import { useCart } from "@/hooks/use-cart";

const detailsSchema = z.object({
  name: z.string().min(1),
  occasion: z.string().min(1),
  message: z.string().min(1),
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
    id: number | string,
    details: { name: string; occasion: string; message: string },
  ) => Promise<void>;
}) {
  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { name: "", occasion: "", message: "" },
  });

  useEffect(() => {
    if (open && item) {
      const dedication = item.type !== "product" ? item.dedication : null;
      form.reset({
        name: dedication?.name ?? "",
        occasion: dedication?.occasion ?? "",
        message: dedication?.message ?? "",
      });
    }
  }, [open, item]);

  const onSubmit = async (v: DetailsFormValues) => {
    if (!item) return;
    await onSave(item.id ?? item.clientId!, v);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Details</DialogTitle>
          <DialogDescription>Provide details</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 grow overflow-hidden flex flex-col"
          >
            <ScrollArea className="grow pr-4">
              <div className="space-y-4">
                {["name", "occasion", "message"].map((field) => (
                  <FormField
                    key={field}
                    control={form.control}
                    name={field as any}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="capitalize">{field}</FormLabel>
                        <FormControl>
                          {field === "message" ? (
                            <Textarea {...f} />
                          ) : (
                            <Input {...f} />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="flex space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                Save Details
              </Button>
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
  onUpdateItem: (id: number | string, patch: any) => void;
  onRemoveItem: (id: number | string) => void;
  onOpenDetailModal: (item: CartItem) => void;
}) {
  const itemId = item.id ?? item.clientId!;
  const displayName =
    item.type === "product" ? item.name : (item.tree?.name ?? "Tree");
  const imageUrl =
    item.type === "product"
      ? (item.image_url ?? "/placeholder-image.jpg")
      : (item.image_url ?? "/default-tree.jpg");

  const duration =
    item.type === "product"
      ? null
      : Number(item.duration ?? item.plan?.duration);
  const durationUnit =
    item.type === "product"
      ? null
      : ((item as any).duration_unit ?? item.plan?.duration_unit ?? "year");

  const handleQuantity = (q: number) => {
    onUpdateItem(itemId, { quantity: Math.max(MIN_QUANTITY, Math.floor(q)) });
  };

  return (
    <Card className="mb-4 border rounded-xl shadow hover:shadow-lg transition">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 rounded-md overflow-hidden">
            <Image
              src={imageUrl}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <h3 className="font-semibold text-lg truncate">{displayName}</h3>

            {item.type === "product" && item.variant && (
              <p className="text-sm text-muted-foreground">
                {[item.variant.color, item.variant.size, item.variant.planter]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            )}

            {item.type !== "product" && (
              <p className="text-sm text-muted-foreground">
                {duration} {durationUnit}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center border rounded-md">
                  <Button
                    disabled={isUpdating || item.quantity <= MIN_QUANTITY}
                    onClick={() => handleQuantity(item.quantity - 1)}
                    size="icon"
                    variant="ghost"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleQuantity(Number(e.target.value))}
                    className="w-12 text-center border-x-0 bg-transparent"
                    disabled={isUpdating}
                  />
                  <Button
                    disabled={isUpdating}
                    onClick={() => handleQuantity(item.quantity + 1)}
                    size="icon"
                    variant="ghost"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {duration !== null &&
                item.type !== "product" &&
                item.available_plans && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Duration</span>
                    <Select
                      value={String(duration)}
                      onValueChange={(value) => {
                        const selectedDuration = Number(value);
                        const plan = item.available_plans?.find(
                          (p) => p.duration === selectedDuration,
                        );
                        if (plan && plan.plan_prices.length > 0) {
                          const planPriceId = plan.plan_prices[0].id;
                          onUpdateItem(itemId, { plan_price_id: planPriceId });
                        }
                      }}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {item.available_plans.map((plan) => {
                          const durationText =
                            plan.duration > 1
                              ? `${plan.duration} ${plan.duration_unit}s`
                              : `${plan.duration} ${plan.duration_unit}`;
                          return (
                            <SelectItem
                              key={plan.id}
                              value={String(plan.duration)}
                            >
                              {durationText} - ₹
                              {plan.plan_prices[0]?.price.toFixed(2)}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
            </div>

            {item.type !== "product" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenDetailModal(item)}
                >
                  {item.dedication?.name ? "Edit Details" : "Add Details"}
                </Button>

                {item.dedication && (
                  <div className="text-sm mt-2">
                    {item.dedication.name && (
                      <p>
                        <b>Name:</b> {item.dedication.name}
                      </p>
                    )}
                    {item.dedication.occasion && (
                      <p>
                        <b>Occasion:</b> {item.dedication.occasion}
                      </p>
                    )}
                    {item.dedication.message && (
                      <p>
                        <b>Message:</b> {item.dedication.message}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col items-end gap-4">
            <p className="text-xl font-bold">
              ₹{(item.price * item.quantity).toFixed(2)}
            </p>
            <Button
              variant="ghost"
              size="icon"
              disabled={isUpdating}
              onClick={() => onRemoveItem(itemId)}
            >
              <Trash2 className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CartPage() {
  const { items, loading, update, remove, clear } = useCart();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const handleDetails = async (
    id: string | number,
    details: { name: string; occasion: string; message: string },
  ) => {
    await update(id, { dedication: details });
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto py-16 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {items.map((item) => (
              <CartItemComponent
                key={item.id ?? item.clientId}
                item={item}
                isUpdating={false}
                onUpdateItem={update}
                onRemoveItem={remove}
                onOpenDetailModal={(i) => {
                  setSelectedItem(i);
                  setDetailModalOpen(true);
                }}
              />
            ))}
          </div>

          <div className="lg:col-span-4">
            <OrderSummary subtotal={subtotal} onClearCart={clear} />
          </div>
        </div>
      )}

      <AddDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        item={selectedItem}
        onSave={handleDetails}
      />
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-12">
      <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
      <Button asChild>
        <Link href="/store">Continue Shopping</Link>
      </Button>
    </div>
  );
}

function OrderSummary({
  subtotal,
  onClearCart,
}: {
  subtotal: number;
  onClearCart: () => Promise<void> | void;
}) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <b>₹{subtotal.toFixed(2)}</b>
        </div>
        <Link className="block" href="/checkout">
          <Button className="w-full mt-4">Place Order</Button>
        </Link>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onClearCart()}
        >
          Clear Cart
        </Button>
      </CardContent>
    </Card>
  );
}

function Loading() {
  return (
    <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
