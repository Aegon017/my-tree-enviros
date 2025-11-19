import axios from "axios";

const api = axios.create( {
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    withCredentials: true,
    withXSRFToken: true,
} );

let csrfInitialized = false;

export async function initializeCsrf(): Promise<void> {
    if ( csrfInitialized ) return;
    await axios.get( `${ process.env.NEXT_PUBLIC_BACKEND_URL }/sanctum/csrf-cookie`, {
        withCredentials: true,
    } );
    csrfInitialized = true;
}

api.interceptors.request.use(
    async ( config ) => {
        const methodsRequiringCsrf = [ "post", "put", "patch", "delete" ];
        if ( config.method && methodsRequiringCsrf.includes( config.method.toLowerCase() ) ) {
            await initializeCsrf();
        }
        config.headers = config.headers ?? {};
        ( config.headers as any )[ "X-Platform" ] = "web";
        return config;
    },
    ( error ) => Promise.reject( error )
);

api.interceptors.response.use(
    ( response ) => response,
    ( error ) => {
        if ( error.response?.status === 401 ) {
            csrfInitialized = false;
            if ( typeof window !== "undefined" ) {
                const p = window.location.pathname;
                if ( !p.startsWith( "/sign-in" ) && !p.startsWith( "/sign-up" ) && !p.startsWith( "/verify-otp" ) ) {
                    window.location.href = "/sign-in";
                }
            }
        }
        if ( error.response?.status === 419 ) {
            csrfInitialized = false;
        }
        return Promise.reject( error );
    }
);

export default api;