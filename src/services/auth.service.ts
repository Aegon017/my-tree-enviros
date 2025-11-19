import { fetchJson } from "@/lib/fetch-json";
import { authStorage } from "@/lib/auth-storage";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { cartService } from "./cart.service";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";

type SignInPayload = { country_code: string; phone: string };
type SignUpPayload = { country_code: string; phone: string; type: string };
type VerifyPayload = { country_code: string; phone: string; otp: string };

function buildHeaders( extra: Record<string, string> = {} ) {
  const token = authStorage.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extra,
  };

  if ( token ) headers[ "Authorization" ] = `Bearer ${ token }`;

  return headers;
}

export const authService = {
  async signIn( payload: SignInPayload ) {
    return await fetchJson( `${ API_BASE }/sign-in`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify( payload ),
    } );
  },

  async signUp( payload: SignUpPayload ) {
    return await fetchJson( `${ API_BASE }/sign-up`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify( payload ),
    } );
  },

  async verifyOtp( payload: VerifyPayload ) {
    const res = await fetchJson<{ user: any; token?: string }>( `${ API_BASE }/verify-otp`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify( payload ),
    } );

    if ( res.data?.token ) {
      authStorage.setToken( res.data.token );
      authStorage.setUser( res.data.user ?? null );

      const cartStore = useCartStore.getState();
      const guestItems = cartStore.cart.items;

      if ( guestItems.length > 0 ) {
        for ( const item of guestItems ) {
          await cartService.add( item );
        }
        cartStore.resetGuestCart();
      }

      await cartStore.fetchServerCart();

      const s = useAuthStore.getState();
      s.setToken( res.data.token );
      s.setUser( res.data.user ?? null );
    }

    return res;
  },

  async resendOtp( payload: { country_code: string; phone: string } ) {
    const res = await fetchJson( `${ API_BASE }/resend-otp`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify( payload ),
    } );

    return res;
  },

  async me() {
    const res = await fetchJson<{ user: any }>( `${ API_BASE }/me`, {
      method: "GET",
      headers: buildHeaders(),
    } );

    if ( res.data?.user ) {
      authStorage.setUser( res.data.user );
      useAuthStore.getState().setUser( res.data.user );
    }

    return res;
  },

  async signOut( all = false ) {
    const body = all ? JSON.stringify( { all: true } ) : undefined;

    try {
      await fetchJson( `${ API_BASE }/sign-out`, {
        method: "POST",
        headers: buildHeaders(),
        body,
      } );
    } finally {
      authStorage.clearAll();
      useAuthStore.getState().clearAuth();
    }
  },
};