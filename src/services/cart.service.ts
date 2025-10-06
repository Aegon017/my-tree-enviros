"use client";

import { authStorage } from "@/lib/auth-storage";

interface Payload {
  [ key: string ]: any;
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const token = authStorage.getToken();

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...( token ? { Authorization: `Bearer ${ token }` } : {} ),
  };
}

export async function addToCart( productId: number, payload: Payload ) {
  const res = await fetch( `${ API_URL }/api/cart/add/${ productId }`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify( payload ),
  } );
  if ( !res.ok ) throw new Error( "Failed to add product to cart" );
  return res.json();
}

export async function addCartDetails( cartId: number, details: Payload ) {
  const res = await fetch( `${ API_URL }/api/cart/addDetails/${ cartId }`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify( details ),
  } );
  if ( !res.ok ) throw new Error( "Failed to add details to cart item" );
  return res.json();
}

export async function getCart() {
  const res = await fetch( `${ API_URL }/api/cart`, {
    headers: getAuthHeaders(),
  } );
  if ( !res.ok ) throw new Error( "Failed to fetch cart" );
  return res.json();
}

export async function removeCartItem( cartId: number ) {
  const res = await fetch( `${ API_URL }/api/cart/remove/${ cartId }`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  } );
  if ( !res.ok ) throw new Error( "Failed to remove cart item" );
  return res.json();
}

export async function clearCart() {
  const res = await fetch( `${ API_URL }/api/cart/clear`, {
    headers: getAuthHeaders(),
  } );
  if ( !res.ok ) throw new Error( "Failed to clear cart" );
  return res.json();
}
