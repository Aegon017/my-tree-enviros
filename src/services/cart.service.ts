import api from "@/lib/axios";

export const cartApi = {
  get: () => api.get( "/cart" ),

  add: ( payload: any ) => api.post( "/cart/items", payload ),

  update: ( itemId: number, quantity: number ) => api.put( `/cart/items/${ itemId }`, { quantity } ),

  remove: ( itemId: number ) => api.delete( `/cart/items/${ itemId }` ),

  clear: () => api.delete( "/cart" ),
};