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

export const cartService = {
  get: () =>
    fetchJson( `${ API_BASE }/cart`, {
      method: "GET",
      headers: headers(),
    } ),

  add: ( payload: any ) =>
    fetchJson( `${ API_BASE }/cart/items`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify( payload ),
    } ),

  update: ( itemId: number, quantity: number ) =>
    fetchJson( `${ API_BASE }/cart/items/${ itemId }`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify( { quantity } ),
    } ),

  remove: ( itemId: number ) =>
    fetchJson( `${ API_BASE }/cart/items/${ itemId }`, {
      method: "DELETE",
      headers: headers(),
    } ),

  clear: () =>
    fetchJson( `${ API_BASE }/cart`, {
      method: "DELETE",
      headers: headers(),
    } ),
};