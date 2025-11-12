"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CartItem } from "@/types/cart.type";
import type { ProductVariant } from "@/types/variant.types";

interface Props {
  item: CartItem;
  isUpdating: boolean;
  onUpdate: ( variantId: number, params: CartItem ) => void;
  onRemove: ( cartItemId: number ) => void;
}

export default function CartItemCard( { item, isUpdating, onUpdate, onRemove }: Props ) {
  const [ inputQuantity, setInputQuantity ] = useState( item.quantity );

  useEffect( () => {
    setInputQuantity( item.quantity );
  }, [ item.quantity ] );

  const getCartParams = useCallback(
    ( quantity: number ): CartItem => ( {
      ...item,
      quantity,
      type: item.type ?? "product",
      product_type: item.product_type ?? 2,
      duration: item.duration ?? 1,
      name: item.name ?? "Customer",
      occasion: item.occasion ?? "General",
      message: item.message ?? "Thank you!",
      location_id: item.location_id ?? 1,
    } ),
    [ item ],
  );

  const handleQuantityChange = useCallback(
    ( value: number ) => {
      const newQuantity = Math.max( 1, value );
      setInputQuantity( newQuantity );

      const variantId =
        item.product_variant_id ??
        item.variant?.id ??
        item.metadata?.product_variant_id ??
        item.item?.product?.variants?.[ 0 ]?.id;

      if ( !variantId ) return;
      onUpdate( variantId, getCartParams( newQuantity ) );
    },
    [ item, onUpdate, getCartParams ],
  );

  const handleInputChange = useCallback(
    ( e: React.ChangeEvent<HTMLInputElement> ) => {
      const value = parseInt( e.target.value );
      if ( !isNaN( value ) && value >= 1 ) handleQuantityChange( value );
    },
    [ handleQuantityChange ],
  );

  const getProductData = useCallback( () => {
    const product = item.product ?? item.ecom_product ?? item.item?.product;
    const variant =
      item.metadata?.selected_variant ??
      item.variant ??
      product?.variants?.find( ( v ) => v.id === item.product_variant_id ) ??
      product?.variants?.[ 0 ];

    const image =
      ( variant as ProductVariant )?.image_urls?.[ 0 ]?.url ??
      item.image ??
      "/placeholder.jpg";

    return {
      name: item.name ?? product?.name ?? "Product",
      botanical_name: product?.botanical_name ?? "",
      price: item.price,
      image,
      variant,
    };
  }, [ item ] );

  const productData = getProductData();
  const totalPrice = ( productData.price * inputQuantity ).toFixed( 2 );

  // ✅ Safe type narrowing for variant
  const variant = productData.variant as ProductVariant | undefined;
  const variantDetail = variant?.variant ?? null;

  return (
    <Card className="mb-4 py-0">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 mx-auto sm:mx-0 rounded-md overflow-hidden border bg-muted/30">
            <Image
              src={ productData.image }
              alt={ productData.name }
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>

          <div className="flex-1 flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:items-center">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-base line-clamp-2">
                { productData.name }
              </h3>

              { productData.botanical_name && (
                <p className="text-sm text-muted-foreground mt-1">
                  { productData.botanical_name }
                </p>
              ) }

              { variantDetail && (
                <div className="text-xs text-muted-foreground mt-1 space-x-1">
                  { variantDetail.size?.name && <span>Size: { variantDetail.size.name }</span> }
                  { variantDetail.color?.name && <span>• Color: { variantDetail.color.name }</span> }
                  { variantDetail.planter?.name && <span>• Planter: { variantDetail.planter.name }</span> }
                </div>
              ) }
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3 sm:mt-0">
              <div className="flex justify-center sm:justify-start">
                <div className="flex items-center border rounded-md bg-muted/20">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={ () => handleQuantityChange( inputQuantity - 1 ) }
                    disabled={ inputQuantity <= 1 || isUpdating }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={ inputQuantity }
                    onChange={ handleInputChange }
                    className="w-12 text-center border-0 focus:ring-0 text-sm"
                    disabled={ isUpdating }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={ () => handleQuantityChange( inputQuantity + 1 ) }
                    disabled={ isUpdating }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-lg font-bold">₹{ totalPrice }</p>
              </div>

              <div className="flex justify-center sm:justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={ () => onRemove( item.cart_id ?? item.id ) }
                  disabled={ isUpdating }
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