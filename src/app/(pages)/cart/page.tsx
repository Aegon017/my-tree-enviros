"use client";

import { Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import useSWR from "swr";
import AppLayout from "@/components/app-layout";
import CartItemCard from "@/components/cart-item-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { storage } from "@/lib/storage";
import type { CartItem } from "@/types/cart";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";

interface CartResponse {
  status: boolean;
  data: CartItem[];
}

const fetcher = ( url: string ) =>
  fetch( url, {
    headers: { Authorization: `Bearer ${ storage.getToken() }` },
  } ).then( ( res ) => res.json() );

export default function CartPage() {
  const { data, error, isLoading, mutate } = useSWR<CartResponse>(
    `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/cart`,
    fetcher,
  );

  const [ updatingItems, setUpdatingItems ] = useState<Set<number>>( new Set() );

  const updateCartItem = useCallback(
    async ( productId: number, params: CartItem ) => {
      setUpdatingItems( ( prev ) => new Set( prev ).add( productId ) );
      try {
        await fetch(
          `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/cart/add/${ productId }`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${ storage.getToken() }`,
            },
            body: JSON.stringify( params ),
          },
        );
        mutate();
      } catch ( error ) {
        console.error( "Failed to update cart:", error );
      } finally {
        setUpdatingItems( ( prev ) => {
          const newSet = new Set( prev );
          newSet.delete( productId );
          return newSet;
        } );
      }
    },
    [ mutate ],
  );

  const removeItem = useCallback(
    async ( itemId: number ) => {
      setUpdatingItems( ( prev ) => new Set( prev ).add( itemId ) );
      try {
        await fetch(
          `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/cart/remove/${ itemId }`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${ storage.getToken() }`,
            },
          },
        );
        mutate();
      } catch ( error ) {
        console.error( "Failed to remove item:", error );
      } finally {
        setUpdatingItems( ( prev ) => {
          const newSet = new Set( prev );
          newSet.delete( itemId );
          return newSet;
        } );
      }
    },
    [ mutate ],
  );

  if ( error )
    return <div className="container mx-auto p-6">Failed to load cart</div>;

  if ( isLoading ) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const cartItems = data?.data || [];
  const subtotal = cartItems.reduce(
    ( sum, item ) => sum + item.ecom_product.price * item.quantity,
    0,
  );

  return (
    <AppLayout>
      <Section>
        <SectionTitle
          title="Shopping Cart"
          align="center"
          subtitle={
            cartItems.length === 0
              ? "Your cart is currently empty."
              : `You have ${ cartItems.length } item${ cartItems.length > 1 ? "s" : "" } in your cart.`
          }
        />
        { cartItems.length === 0 ? (
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some plants to get started
            </p>
            <div className="text-center">
              <Link href="/shop">
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              { cartItems.map( ( item ) => (
                <CartItemCard
                  key={ item.id }
                  item={ item }
                  isUpdating={ updatingItems.has( item.ecom_product.id ) }
                  onUpdate={ updateCartItem }
                  onRemove={ removeItem }
                />
              ) ) }
            </div>

            <div className="lg:col-span-4">
              <Card className="sticky top-16 py-0">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${ subtotal.toFixed( 2 ) }</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-4 border-t">
                      <span>Total</span>
                      <span>${ subtotal.toFixed( 2 ) }</span>
                    </div>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full mt-6" size="lg">
                      Place Order
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        ) }
      </Section>
    </AppLayout >
  );
}
