import api from "@/lib/axios";

export const cartService = {
  get: () => api.get( "/cart" ),

  addProduct: ( variantId: number, quantity = 1 ) =>
    api.post( "/cart/items", {
      type: "product",
      product_variant_id: variantId,
      quantity,
    } ),

  addSponsor: (
    treeId: number,
    planId: number,
    planPriceId: number,
    quantity: number,
    dedication?: any
  ) =>
    api.post( "/cart/items", {
      type: "sponsor",
      tree_id: treeId,
      plan_id: planId,
      plan_price_id: planPriceId,
      quantity,
      dedication: dedication ?? null,
    } ),

  addAdopt: (
    treeId: number,
    planId: number,
    planPriceId: number,
    quantity: number,
    dedication?: any
  ) =>
    api.post( "/cart/items", {
      type: "adopt",
      tree_id: treeId,
      plan_id: planId,
      plan_price_id: planPriceId,
      quantity,
      dedication: dedication ?? null,
    } ),

  updateQuantity: ( itemId: number, quantity: number ) =>
    api.put( `/cart/items/${ itemId }`, { quantity } ),

  remove: ( itemId: number ) => api.delete( `/cart/items/${ itemId }` ),

  clear: () => api.delete( "/cart" ),
};