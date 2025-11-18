import api from "./http-client";

export const cartClientApi = {
    get: () => api.get( "/cart" ),
    add: ( data: any ) => api.post( "/cart/items", data ),
    update: ( id: number, data: any ) => api.put( `/cart/items/${ id }`, data ),
    remove: ( id: number ) => api.delete( `/cart/items/${ id }` ),
    clear: () => api.delete( "/cart" ),
};
