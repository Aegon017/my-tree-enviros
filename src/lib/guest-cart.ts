const GUEST_CART_KEY = "mte_guest_cart";

export const guestCart = {
    load() {
        if ( typeof window === "undefined" ) return { items: [] };
        const raw = localStorage.getItem( GUEST_CART_KEY );
        return raw ? JSON.parse( raw ) : { items: [] };
    },

    save( cart ) {
        if ( typeof window !== "undefined" ) {
            localStorage.setItem( GUEST_CART_KEY, JSON.stringify( cart ) );
        }
    },

    clear() {
        if ( typeof window !== "undefined" ) {
            localStorage.removeItem( GUEST_CART_KEY );
        }
    },
};