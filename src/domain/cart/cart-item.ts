import { ProductVariantInfo } from "./product-variant";

export interface CartProductItem {
    id: number;
    clientId?: number;
    type: "product";
    product_variant_id?: number;
    quantity: number;
    price: number;
    name: string;
    image_url: string;
    variant: ProductVariantInfo;
}

export interface CartTreeItem {
    id: number;
    clientId?: number;
    type: "sponsor" | "adopt";
    quantity: number;
    duration: number | string;
    duration_unit?: string;
    price: number;
    image_url: string;
    plan_price_id?: number;
    tree: { id: number; name: string };
    plan: { id: number; duration: number; duration_unit?: string };
    dedication: {
        name: string | null;
        occasion: string | null;
        message: string | null;
    } | null;
    available_plans?: Array<{
        id: number;
        duration: number;
        duration_unit?: string;
        plan_prices: Array<{
            id: number;
            price: number;
            plan: {
                id: number;
                duration: number;
                duration_unit: string;
            };
        }>;
    }>;
}

export type CartItem = CartProductItem | CartTreeItem;