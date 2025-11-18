import { cache } from "react";
import { cartServerApi } from "@/services/cart-api-server";
import type { Cart } from "@/domain/cart/cart";

export const getCart = cache( async (): Promise<Cart | null> => {
    const res = await cartServerApi.get();
    return res.data?.data?.cart ?? null;
} );