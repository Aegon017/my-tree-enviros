"use server";

import { cartApi } from "@/services/cart.services";
import { revalidateTag } from "next/cache";

export async function addToCartAction( payload: any ) {
    await cartApi.add( payload );
    revalidateTag( "cart" );
}

export async function updateCartAction( id: number, quantity: number ) {
    await cartApi.update( id, quantity );
    revalidateTag( "cart" );
}

export async function removeFromCartAction( id: number ) {
    await cartApi.remove( id );
    revalidateTag( "cart" );
}

export async function clearCartAction() {
    await cartApi.clear();
    revalidateTag( "cart" );
}