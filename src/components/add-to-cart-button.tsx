"use client";

import { ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAuthStore } from "@/store/auth-store";

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
  onSuccess?: () => void;
  treeData?: any;
  planPriceData?: any;
  productData?: any;
  variantData?: any;
  productImages?: any[];
};

export default function AddToCartButton({
  type,
  variantId,
  treeId,
  planId,
  planPriceId,
  quantity = 1,
  dedication,
  disabled,
  validateDedication,
  onSuccess,
  treeData,
  planPriceData,
  productData,
  variantData,
  productImages,
  className,
}: Props) {
  const { loading, add, items } = useCart();
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  const isInCart = useMemo(() => {
    if (type === "product" && variantId) {
      return items.some(
        (item) => item.type === "product" && item.product_variant_id === variantId
      );
    }
    if ((type === "sponsor" || type === "adopt") && treeId && planPriceId) {
      return items.some(
        (item) =>
          item.type !== "product" &&
          item.tree?.id === treeId &&
          item.plan_price_id === planPriceId
      );
    }
    return false;
  }, [items, type, variantId, treeId, planPriceId]);

  const handle = async () => {
    if (isInCart) {
      router.push("/cart");
      return;
    }

    if (dedication) {
      const isValid = await validateDedication?.();
      if (!isValid) return;

      const required = {
        name: dedication.name.trim(),
        occasion: dedication.occasion.trim(),
        message: dedication.message.trim(),
      };

      if (!required.name || !required.occasion || !required.message) {
        toast.error("Dedication is required");
        return;
      }

      if (type === "sponsor" || type === "adopt") {
        if (!treeId || !planId || !planPriceId)
          return toast.error("Invalid sponsorship/adoption details");

        // Backend expects `type: 'tree'` for tree items. For guests, keep original type
        const payloadType = token ? "tree" : type;

        await add({
          type: payloadType,
          tree_id: treeId,
          plan_id: planId,
          plan_price_id: planPriceId,
          quantity,
          dedication: required,
          tree: treeData,
          planPrice: planPriceData,
        });
        onSuccess?.();
        return;
      }
    }

    if (type === "product") {
      if (!variantId) return toast.error("Invalid product variant");

      return add({
        type: "product",
        product_variant_id: variantId,
        quantity,
        product: productData,
        variant: variantData,
        images: productImages,
      });
    }

    toast.error("Invalid item type");
  };

  return (
    <Button
      type="button"
      onClick={handle}
      disabled={disabled || loading}
      loading={loading}
      className={className ?? "flex gap-2"}
    >
      {isInCart ? (
        <>
          <ArrowRight className="w-4 h-4" />
          Go to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          Add To Cart
        </>
      )}
    </Button>
  );
}
