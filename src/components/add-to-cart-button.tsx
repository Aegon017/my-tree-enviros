"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";

type Props = {
  type: "product" | "sponsor" | "adopt";
  variantId?: number;
  treeId?: number;
  planId?: number;
  planPriceId?: number;
  quantity?: number;
  dedication?: {
    name: string;
    occasion: string;
    message: string;
  };
  disabled?: boolean;
  className?: string;
  validateDedication?: () => Promise<boolean | null>;
};

export default function AddToCartButton( {
  type,
  variantId,
  treeId,
  planId,
  planPriceId,
  quantity = 1,
  dedication,
  disabled,
  validateDedication,
  className,
}: Props ) {
  const { loading, add } = useCart();

  const handle = async () => {
    if ( dedication ) {
      const isValid = await validateDedication?.();
      if ( !isValid ) return;

      const required = {
        name: dedication.name.trim(),
        occasion: dedication.occasion.trim(),
        message: dedication.message.trim(),
      };

      if ( !required.name || !required.occasion || !required.message ) {
        toast.error( "Dedication is required" );
        return;
      }

      if ( type === "sponsor" ) {
        if ( !treeId || !planId || !planPriceId )
          return toast.error( "Invalid sponsorship details" );

        return add( {
          type: "sponsor",
          tree_id: treeId,
          plan_id: planId,
          plan_price_id: planPriceId,
          quantity,
          dedication: required,
        } );
      }

      if ( type === "adopt" ) {
        if ( !treeId || !planId || !planPriceId )
          return toast.error( "Invalid adoption details" );

        return add( {
          type: "adopt",
          tree_id: treeId,
          plan_id: planId,
          plan_price_id: planPriceId,
          quantity,
          dedication: required,
        } );
      }
    }

    if ( type === "product" ) {
      if ( !variantId ) return toast.error( "Invalid product variant" );

      return add( {
        type: "product",
        product_variant_id: variantId,
        quantity,
      } );
    }

    toast.error( "Invalid item type" );
  };

  return (
    <Button
      type="button"
      onClick={ handle }
      disabled={ disabled || loading }
      loading={ loading }
      className={ className ?? "flex gap-2" }
    >
      <ShoppingCart className="w-4 h-4" />
      Add To Cart
    </Button>
  );
}
