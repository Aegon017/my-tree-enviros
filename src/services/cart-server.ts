import { serverApi } from "./http-server";

export const cartServerApi = {
    get: () => serverApi.get( "/cart" ),
};