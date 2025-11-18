"use client";

import { mergeGuestIntoServer } from "@/lib/cart/merge-cart";
import { cartClientApi } from "@/services/cart-client";
import { cartServerApi } from "@/services/cart-server";
import { useGuestCartStore } from "@/store/cart-store";

export async function syncCartOnLogin() {
    const guest = useGuestCartStore.getState().items;
    if ( !guest.length ) return;

    const server = await cartServerApi.get();
    const serverItems = server.data?.data?.cart?.items ?? [];

    const merged = mergeGuestIntoServer( guest, serverItems );

    await cartClientApi.clear();

    for ( const item of merged ) {
        await cartClientApi.add( {
            type: item.type,
            ...( item.type === "product"
                ? {
                    product_variant_id: ( item as any ).variant?.sku,
                    quantity: item.quantity,
                }
                : {
                    tree_id: item.tree?.id,
                    plan_id: item.plan?.id,
                    plan_price_id: item.plan?.id,
                    quantity: item.quantity,
                    dedication: item.dedication,
                } ),
        } );
    }

    useGuestCartStore.getState().clear();
}