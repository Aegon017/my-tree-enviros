import api from "@/lib/axios";

export const cartService = {
  get: () => api.get( "/cart" ),
  addProduct: ( variantId: number, quantity = 1 ) =>
    api.post( "/cart", { item_type: "product", product_variant_id: variantId, quantity } ),
  addProductByProductId: ( productId: number, quantity = 1 ) =>
    api.post( "/cart", { item_type: "product", product_id: productId, quantity } ),
  addTree: ( treeInstanceId: number, planPriceId: number ) =>
    api.post( "/cart", { item_type: "tree", tree_instance_id: treeInstanceId, tree_plan_price_id: planPriceId } ),
  updateQuantity: ( itemId: number, quantity: number ) => api.put( `/cart/items/${ itemId }`, { quantity } ),
  remove: ( itemId: number ) => api.delete( `/cart/items/${ itemId }` ),
  clear: () => api.delete( "/cart" ),
};