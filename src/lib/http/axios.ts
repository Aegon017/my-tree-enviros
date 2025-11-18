"use client";

import axios from "axios";
import { initCsrf, resetCsrf } from "./csrf";

const api = axios.create( {
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    withCredentials: true,
    withXSRFToken: true,
} );

api.interceptors.request.use(
    async ( config ) => {
        const methods = [ "post", "put", "patch", "delete" ];
        if ( config.method && methods.includes( config.method.toLowerCase() ) ) {
            await initCsrf();
        }

        config.headers = config.headers ?? {};
        config.headers[ "X-Platform" ] = "web";

        return config;
    },
    ( error ) => Promise.reject( error )
);

api.interceptors.response.use(
    ( response ) => response,
    ( error ) => {
        const status = error.response?.status;
        const url = error.config?.url;

        if ( status === 419 ) {
            resetCsrf();
        }

        if ( status === 401 ) {
            resetCsrf();

            if ( typeof window === "undefined" ) return Promise.reject( error );

            const guestAllowed = [ "/cart", "/cart/items" ];
            const allowed = guestAllowed.some( ( r ) => url?.includes( r ) );
            if ( allowed ) return Promise.reject( error );

            const authPages = [ "/sign-in", "/sign-up", "/verify-otp" ];
            const onAuthPage = authPages.some( ( p ) =>
                window.location.pathname.startsWith( p )
            );
            if ( !onAuthPage ) {
                window.location.href = "/sign-in";
            }
        }

        return Promise.reject( error );
    }
);

export default api; 