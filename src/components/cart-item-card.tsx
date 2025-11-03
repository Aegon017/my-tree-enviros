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
      // Handle both guest and backend cart data for product ID
      const productId =
        // Backend format: item.item.product?.id
        item.item?.product?.id ??
        // Guest format: item.ecom_product?.id, item.product_id, or item.id
        item.ecom_product?.id ??
        item.product_id ??
        item.id;
      onUpdate(productId, getCartParams(newQuantity));
    },
    [item, onUpdate, getCartParams],
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

  // Handle both guest cart (localStorage) and backend cart data
  const getProductData = () => {
    // Backend cart format: item.item contains product data
    if (item.item) {
      const product = item.item.product;
      // Get the full variant data from the product's default variant if available
      let fullVariant = null;
      if (product?.variants && product.variants.length > 0) {
        fullVariant = product.variants[0]; // Use first variant as default
      }

      return {
        name: item.item.name,
        botanical_name: product?.botanical_name || "",
        image: item.item.image,
        price: item.price,
        variant: fullVariant ? {
          sku: fullVariant.sku,
          color: fullVariant.variant?.color,
          size: fullVariant.variant?.size,
          planter: fullVariant.variant?.planter,
          name: fullVariant.variant_name,
          price: fullVariant.price,
          stock_quantity: fullVariant.stock_quantity,
          is_instock: fullVariant.is_instock,
          images: fullVariant.images,
        } : item.item.variant,
        product: product,
      };
    }
    // Guest cart format: direct properties
    return {
      name: item.ecom_product?.name ?? item.name,
      botanical_name: item.ecom_product?.botanical_name ?? "",
      image: item.ecom_product?.thumbnail_url ?? item.image,
      price: item.price,
      variant: item.variant,
      product: item.product || item.ecom_product,
    };
  };

  const productData = getProductData();
  
  const totalPrice = (productData.price * inputQuantity).toFixed(2);

  return (
    <Card className="mb-4 py-0">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 mx-auto sm:mx-0 rounded-md overflow-hidden">
            <Image
              src={productData.image ?? "/placeholder.jpg"}
              alt={productData.name || "Product"}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>

          <div className="flex-1 flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:items-center">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-base line-clamp-2">
                {productData.name || "Product"}
              </h3>
              {productData.botanical_name && (
                <p className="text-sm text-muted-foreground mt-1">
                  {productData.botanical_name}
                </p>
              )}
              {/* Variant information */}
              {productData.variant && (
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Variant:</span>{" "}
                  {productData.variant.size && (
                    <span>Size: {productData.variant.size.name}</span>
                  )}
                  {productData.variant.size && productData.variant.color && " • "}
                  {productData.variant.color && (
                    <span>Color: {productData.variant.color.name}</span>
                  )}
                  {(productData.variant.size || productData.variant.color) && productData.variant.planter && " • "}
                  {productData.variant.planter && (
                    <span>Planter: {productData.variant.planter.name}</span>
                  )}
                </div>
              )}
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
                  onClick={() => onRemove(item.cart_id ?? item.id)}
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
