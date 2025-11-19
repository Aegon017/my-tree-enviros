import { ProductVariantInfo } from "./product-variant";

export interface CartProductItem {
    id: number;
    clientId?: string;
    type: "product";
    quantity: number;
    price: number;
    name: string;
    image_url: string;
    variant: ProductVariantInfo;
}

export interface CartTreeItem {
    id: number;
    clientId?: string;
    type: "sponsor" | "adopt";
    quantity: number;
    duration: number | string;
    price: number;
    tree: { id: number; name: string };
    plan: { id: number; duration: number };
    dedication: {
        name: string | null;
        occasion: string | null;
        message: string | null;
    } | null;
}

export type CartItem = CartProductItem | CartTreeItem;