import Cookies from "js-cookie";

export const cookies = {
    get: ( key: string ) => ( typeof window !== "undefined" ? Cookies.get( key ) || null : null ),

    set: ( key: string, value: string, days = 7 ) => {
        if ( typeof window !== "undefined" ) {
            Cookies.set( key, value, { expires: days } );
        }
    },

    remove: ( key: string ) => {
        if ( typeof window !== "undefined" ) {
            Cookies.remove( key );
        }
    },
};