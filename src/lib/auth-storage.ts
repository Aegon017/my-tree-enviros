const TOKEN_KEY = "mte_auth_token";
const USER_KEY = "mte_auth_user";
const RESEND_KEY = "mte_resend_time";

function setCookie( name: string, value: string, days = 30 ) {
  const expires = new Date( Date.now() + days * 86400_000 ).toUTCString();
  document.cookie = `${ name }=${ encodeURIComponent( value ) }; expires=${ expires }; path=/; SameSite=Strict; Secure`;
}

function getCookie( name: string ): string | null {
  const match = document.cookie.match( new RegExp( "(^| )" + name + "=([^;]+)" ) );
  return match ? decodeURIComponent( match[ 2 ] ) : null;
}

export const authStorage = {
  getToken(): string | null {
    if ( typeof window === "undefined" ) return null;
    return localStorage.getItem( TOKEN_KEY ) || getCookie( TOKEN_KEY );
  },
  setToken( token: string ) {
    if ( typeof window !== "undefined" ) {
      localStorage.setItem( TOKEN_KEY, token );
      setCookie( TOKEN_KEY, token, 30 );
    }
  },
  clearToken() {
    if ( typeof window !== "undefined" ) {
      localStorage.removeItem( TOKEN_KEY );
      document.cookie = `${ TOKEN_KEY }=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  },
  getUser(): any | null {
    if ( typeof window === "undefined" ) return null;
    const raw = localStorage.getItem( USER_KEY );
    return raw ? JSON.parse( raw ) : null;
  },
  setUser( user: any ) {
    if ( typeof window !== "undefined" ) {
      localStorage.setItem( USER_KEY, JSON.stringify( user ) );
    }
  },
  clearUser() {
    if ( typeof window !== "undefined" ) {
      localStorage.removeItem( USER_KEY );
    }
  },
  setResendTime( ts: number ) {
    if ( typeof window !== "undefined" ) localStorage.setItem( RESEND_KEY, String( ts ) );
  },
  getResendTime(): number | null {
    if ( typeof window === "undefined" ) return null;
    const v = localStorage.getItem( RESEND_KEY );
    return v ? Number( v ) : null;
  },
  clearAll() {
    this.clearToken();
    this.clearUser();
    if ( typeof window !== "undefined" ) localStorage.removeItem( RESEND_KEY );
  },
};