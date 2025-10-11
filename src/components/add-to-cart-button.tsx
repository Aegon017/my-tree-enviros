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
import { authStorage } from "@/lib/auth-storage";

interface AddToCartButtonProps {
  productId: number;
  quantity: number;
  selectedYears?: number;
  priceOptionId?: number;
  productType: number;
  cartType: number;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
}

interface PendingAction {
  cartType: number;
  productType: number;
}

interface ApiError {
  message?: string;
}

export default function AddToCartButton( {
  productId,
  quantity,
  selectedYears,
  priceOptionId,
  productType,
  cartType,
  variant = "default",
  disabled = false,
}: AddToCartButtonProps ) {
  const router = useRouter();
  const [ showClearCartDialog, setShowClearCartDialog ] = useState( false );
  const [ pendingAction, setPendingAction ] = useState<PendingAction | null>( null );
  const [ isLoading, setIsLoading ] = useState( false );

  const { cartItems, addItem, clearCart } = useCart();

  const isProductInCart = cartItems?.some( ( item ) => item.product_id === productId ) ?? false;

  const handleCartAction = async () => {
    if ( isProductInCart ) {
      router.push( "/cart" );
      return;
    }

    const token = authStorage.getToken();
    if ( !token ) {
      toast.error( "Please login to continue" );
      return;
    }

    const payload = {
      quantity,
      type: 1,
      product_type: productType,
      cart_type: cartType,
      duration: selectedYears,
      price_option_id: priceOptionId,
    };

    setIsLoading( true );
    try {
      await addItem( productId, payload );
      const actionText = cartType === 1 ? "added to cart" : "sponsored";
      const treeText = quantity > 1 ? "trees" : "tree";
      toast.success( `${ quantity } ${ treeText } ${ actionText }` );
    } catch ( error ) {
      const errorMessage = ( error as ApiError )?.message || "Failed to process request";

      if ( errorMessage.includes( "same type" ) ) {
        setPendingAction( { cartType, productType } );
        setShowClearCartDialog( true );
      } else {
        toast.error( errorMessage );
      }
    } finally {
      setIsLoading( false );
    }
  };

  const handleClearCartAndAdd = async () => {
    if ( !pendingAction ) return;

    setIsLoading( true );
    try {
      await clearCart();

      const payload = {
        quantity,
        type: 1,
        product_type: pendingAction.productType,
        cart_type: pendingAction.cartType,
        duration: selectedYears,
        price_option_id: priceOptionId,
      };

      await addItem( productId, payload );
      const actionText = pendingAction.cartType === 1 ? "added to cart" : "sponsored";
      const treeText = quantity > 1 ? "trees" : "tree";
      toast.success( `Cart cleared and ${ quantity } ${ treeText } ${ actionText }` );
    } catch ( error ) {
      const errorMessage = ( error as ApiError )?.message || "Failed to clear cart and add item";
      toast.error( errorMessage );
    } finally {
      setShowClearCartDialog( false );
      setPendingAction( null );
      setIsLoading( false );
    }
  };

  return (
    <>
      <Button
        variant={ variant }
        className="flex-1 w-full"
        onClick={ handleCartAction }
        disabled={ disabled || isLoading }
        // loading={ isLoading }
      >
        { isProductInCart ? (
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
        ) }
      </Button>

      <Dialog open={ showClearCartDialog } onOpenChange={ setShowClearCartDialog }>
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
              onClick={ () => setShowClearCartDialog( false ) }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={ handleClearCartAndAdd }
              disabled={ isLoading }
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