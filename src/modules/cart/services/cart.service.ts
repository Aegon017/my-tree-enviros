import api from "@/services/http-client";
import { BackendCartResponse } from "../types/cart.types";

const CART_URL = "/cart";

export const cartService = {
    async index() {
        return await api.get<{ cart: BackendCartResponse }>(CART_URL);
    },

    async add(item: Record<string, any>) {
        return await api.post<{ cart: BackendCartResponse }>(
            `${CART_URL}/items`,
            item,
        );
    },

    async update(id: number, item: Record<string, any>) {
        return await api.put<{ cart: BackendCartResponse }>(
            `${CART_URL}/items/${id}`,
            item,
        );
    },

    async destroy(id: number) {
        return await api.delete<{ cart: BackendCartResponse }>(
            `${CART_URL}/items/${id}`,
        );
    },

    async clear() {
        return await api.delete<{ cart: BackendCartResponse }>(CART_URL);
    },
};
