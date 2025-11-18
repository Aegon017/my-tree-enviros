import axios from "axios";

let csrfInitialized = false;

export async function initCsrf() {
    if ( csrfInitialized ) return;

    try {
        await axios.get(
            `${ process.env.NEXT_PUBLIC_BACKEND_URL }/sanctum/csrf-cookie`,
            { withCredentials: true }
        );
        csrfInitialized = true;
    } catch ( e ) {
        csrfInitialized = false;
        throw e;
    }
}

export function resetCsrf() {
    csrfInitialized = false;
}