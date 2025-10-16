"use client";

import api from "@/lib/axios";

interface Payload {
  [key: string]: any;
}

export async function addToCart(productId: number, payload: Payload) {
  const res = await api.post(`/cart/add/${productId}`, payload);
  return res.data;
}

export async function addCartDetails(cartId: number, details: Payload) {
  const res = await api.post(`/cart/addDetails/${cartId}`, details);
  return res.data;
}

export async function getCart() {
  const res = await api.get(`/cart`);
  return res.data.data;
}

export async function removeCartItem(cartId: number) {
  const res = await api.delete(`/cart/remove/${cartId}`);
  return res.data;
}

export async function clearCart() {
  const res = await api.get(`/cart/clear`);
  return res.data;
}
