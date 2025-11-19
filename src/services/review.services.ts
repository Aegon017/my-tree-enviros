import { fetchJson } from "@/lib/fetch-json";
import { authStorage } from "@/lib/auth-storage";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL;

function headers() {
    const token = authStorage.getToken();
    return {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...( token ? { Authorization: `Bearer ${ token }` } : {} ),
    };
}

export type ReviewFormValues = { rating: number; review: string };

export const reviewService = {
    submit( slug: string, payload: ReviewFormValues ) {
        return fetchJson( `${ API_BASE }/products/${ slug }/reviews`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify( payload ),
        } ).then( ( r ) => r.data );
    },

    update( reviewId: number, slug: string, payload: ReviewFormValues ) {
        return fetchJson( `${ API_BASE }/products/${ slug }/reviews/${ reviewId }`, {
            method: "PUT",
            headers: headers(),
            body: JSON.stringify( payload ),
        } ).then( ( r ) => r.data );
    },
};