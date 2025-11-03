"use client";

import { ArrowRight, CheckCircle2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { cartService } from "@/services/cart.service";

interface AddToCartButtonProps {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  selectedYears?: number;
  priceOptionId?: number;
  productType: number;
  cartType: number;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  selectedVariantId?: number;
}

interface PendingAction {
  cartType: number;
  productType: number;
}

interface ApiError {
  message?: string;
}

export default function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImage,
  quantity,
  selectedYears,
  priceOptionId,
  productType,
  cartType,
  variant = "default",
  disabled = false,
  selectedVariantId,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const { items: cartItems, addToCart, clearAllItems, isGuest } = useCart();
  const { isAuthenticated } = useAuth();

  const isProductInCart =
    cartItems?.some((item) => item.product_id === productId) ?? false;

  const handleCartAction = async () => {
    if (isProductInCart) {
      router.push("/cart");
      return;
    }

    // Guest mode is allowed - no login required
    const cartItem = {
      id: productId,
      product_id: productId,
      name: productName,
      type: (productType === 1 ? "tree" : "product") as "tree" | "product",
      price: productPrice,
      quantity,
      image: productImage,
      product_type: productType,
      product_variant_id: selectedVariantId,
      metadata: {
        duration: selectedYears,
        plan_id: priceOptionId,
        product_variant_id: selectedVariantId,
      },
    };

    setIsLoading(true);
    try {
      // If authenticated user, add to backend
      if (isAuthenticated && !isGuest) {
        const cartPayload: any = {
          type: cartType,
          product_type: productType,
          quantity,
          duration: selectedYears,
          name: productName,
          occasion: undefined, // Tree products would have this
          message: undefined,  // Tree products would have this
          location_id: undefined, // Tree products would have this
          item_type: "product", // Required field for backend
        };

        // Only add product_variant_id if a variant is actually selected
        if (selectedVariantId) {
          cartPayload.product_variant_id = selectedVariantId;
        }

        await cartService.addToCart(productId, cartPayload);
      }

      // Add to local cart (for both guest and authenticated users)
      addToCart(cartItem);
      const actionText = cartType === 1 ? "added to cart" : "sponsored";
      const treeText = quantity > 1 ? "trees" : "tree";
      toast.success(`${quantity} ${treeText} ${actionText}`);
    } catch (error) {
      const errorMessage =
        (error as ApiError)?.message || "Failed to process request";

      if (errorMessage.includes("same type")) {
        setPendingAction({ cartType, productType });
        setShowClearCartDialog(true);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCartAndAdd = async () => {
    if (!pendingAction) return;

    setIsLoading(true);
    try {
      // If authenticated user, clear backend cart
      if (isAuthenticated && !isGuest) {
        await cartService.clearCart();
      }

      clearAllItems();

      // If authenticated user, add to backend
      if (isAuthenticated && !isGuest) {
        const cartPayload: any = {
          type: pendingAction.cartType,
          product_type: pendingAction.productType,
          quantity,
          duration: selectedYears,
          name: productName,
          occasion: undefined,
          message: undefined,
          location_id: undefined,
          item_type: "product",
        };

        // Only add product_variant_id if a variant is actually selected
        if (selectedVariantId) {
          cartPayload.product_variant_id = selectedVariantId;
        }

        await cartService.addToCart(productId, cartPayload);
      }

      const cartItem = {
        id: productId,
        product_id: productId,
        name: productName,
        type: (pendingAction.productType === 1 ? "tree" : "product") as
          | "tree"
          | "product",
        price: productPrice,
        quantity,
        image: productImage,
        product_type: pendingAction.productType,
        product_variant_id: selectedVariantId,
        metadata: {
          duration: selectedYears,
          plan_id: priceOptionId,
          product_variant_id: selectedVariantId,
        },
      };

      addToCart(cartItem);
      const actionText =
        pendingAction.cartType === 1 ? "added to cart" : "sponsored";
      const treeText = quantity > 1 ? "trees" : "tree";
      toast.success(`Cart cleared and ${quantity} ${treeText} ${actionText}`);
    } catch (error) {
      const errorMessage =
        (error as ApiError)?.message || "Failed to clear cart and add item";
      toast.error(errorMessage);
    } finally {
      setShowClearCartDialog(false);
      setPendingAction(null);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        className="flex-1 w-full"
        onClick={handleCartAction}
        disabled={disabled || isLoading}
        // loading={ isLoading }
      >
        {isProductInCart ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Go to Cart
            <ArrowRight className="w-4 h-4" />
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            Add To Cart
          </>
        )}
      </Button>

      <Dialog open={showClearCartDialog} onOpenChange={setShowClearCartDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear Cart</DialogTitle>
            <DialogDescription>
              You can only add products of the same type. Please clear the cart
              or add products of the same type.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowClearCartDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearCartAndAdd}
              disabled={isLoading}
              // loading={ isLoading }
            >
              Clear Cart & Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
