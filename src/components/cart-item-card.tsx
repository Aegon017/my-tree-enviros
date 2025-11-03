"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CartItem } from "@/types/cart.type";

interface Props {
  item: CartItem;
  isUpdating: boolean;
  onUpdate: (productId: number, params: CartItem) => void;
  onRemove: (itemId: number) => void;
}

export default function CartItemCard({
  item,
  isUpdating,
  onUpdate,
  onRemove,
}: Props) {
  const [inputQuantity, setInputQuantity] = useState(item.quantity);

  useEffect(() => {
    setInputQuantity(item.quantity);
  }, [item.quantity]);

  const getCartParams = useCallback(
    (quantity: number): CartItem => ({
      ...item,
      quantity,
      type: item.type ?? "product",
      product_type: item.product_type ?? 2,
      duration: item.duration ?? 1,
      name: item.name ?? "Customer",
      occasion: item.occasion ?? "General",
      message: item.message ?? "Thank you!",
      location_id: item.location_id ?? 1,
    }),
    [item],
  );

  const handleQuantityChange = useCallback(
    (value: number) => {
      const newQuantity = Math.max(1, value);
      setInputQuantity(newQuantity);
      const productId = item.ecom_product?.id ?? item.product_id ?? item.id;
      onUpdate(productId, getCartParams(newQuantity));
    },
    [item.ecom_product?.id, item.product_id, item.id, onUpdate, getCartParams],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 1) {
        handleQuantityChange(value);
      }
    },
    [handleQuantityChange],
  );

  const totalPrice = (
    ((item.ecom_product?.price as number) ?? 0) * inputQuantity
  ).toFixed(2);

  return (
    <Card className="mb-4 py-0">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 mx-auto sm:mx-0 rounded-md overflow-hidden">
            <Image
              src={item.ecom_product?.thumbnail_url ?? "/placeholder.jpg"}
              alt={item.name ?? "Product"}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>

          <div className="flex-1 flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:items-center">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-base line-clamp-2">
                {item.ecom_product?.name ?? item.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {item.ecom_product?.botanical_name ?? ""}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2 sm:mt-0">
              <div className="flex justify-center sm:justify-start">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(inputQuantity - 1)}
                    disabled={inputQuantity <= 1 || isUpdating}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={inputQuantity}
                    onChange={handleInputChange}
                    className="w-12 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    disabled={isUpdating}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(inputQuantity + 1)}
                    disabled={isUpdating}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-lg font-bold">₹{totalPrice}</p>
              </div>

              <div className="flex justify-center sm:justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRemove(item.id)}
                  disabled={isUpdating}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
