"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

export default function AddToCartButton( {
  type,
  treeId,
  planId,
  planPriceId,
  quantity,
  dedication,
  disabled,
}: any ) {
  const [ showConfirm, setShowConfirm ] = useState( false );
  const [ loading, setLoading ] = useState( false );

  const { addSponsor, addAdopt, clear } = useCart();

  const handleAdd = async () => {
    setLoading( true );

    try {
      if ( type === "sponsor" ) {
        await addSponsor( treeId, planId, planPriceId, quantity, dedication );
      }

      if ( type === "adopt" ) {
        await addAdopt( treeId, planId, planPriceId, quantity, dedication );
      }

    } catch ( error: any ) {
      const msg = error?.response?.data?.message || "Error";

      if ( msg.includes( "same type" ) ) {
        setShowConfirm( true );
      } else {
        toast.error( msg );
      }
    } finally {
      setLoading( false );
    }
  };

  const handleClearAndAdd = async () => {
    setLoading( true );

    try {
      await clear();
      await handleAdd();
      toast.success( "Cart cleared & item added" );
    } catch {
      toast.error( "Unable to clear cart" );
    } finally {
      setShowConfirm( false );
      setLoading( false );
    }
  };

  return (
    <>
      <Button disabled={ disabled || loading } onClick={ handleAdd } className="w-full flex gap-2">
        <ShoppingCart className="w-4 h-4" />
        Add To Cart
      </Button>

      <Dialog open={ showConfirm } onOpenChange={ setShowConfirm }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Cart?</DialogTitle>
            <DialogDescription>
              You can only add one type of item at a time. Clear cart to continue?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="outline" onClick={ () => setShowConfirm( false ) }>
              Cancel
            </Button>
            <Button variant="destructive" onClick={ handleClearAndAdd } disabled={ loading }>
              Clear & Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}