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
  dedication: {
    name: string;
    occasion: string;
    message: string;
  };
  disabled?: boolean;
  className?: string;

  validateDedication: () => Promise<boolean>;
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
    const isValid = await validateDedication();
    if ( !isValid ) {
      toast.error( "Please fill all dedication fields." );
      return;
    }

    const requiredDedication = {
      name: dedication.name?.trim(),
      occasion: dedication.occasion?.trim(),
      message: dedication.message?.trim(),
    };

    if (
      !requiredDedication.name ||
      !requiredDedication.occasion ||
      !requiredDedication.message
    ) {
      toast.error( "Dedication is required." );
      return;
    }

    if ( type === "product" ) {
      if ( !variantId ) return toast.error( "Invalid product variant" );

      return add( {
        type: "product",
        product_variant_id: variantId,
        quantity,
      } );
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
        dedication: requiredDedication,
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
        dedication: requiredDedication,
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