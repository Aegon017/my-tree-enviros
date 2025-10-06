import { cookies } from "./cookies";

export const authStorage = {
    getToken: () => cookies.get( "auth_token" ),
    setToken: ( token: string ) => cookies.set( "auth_token", token ),
    clearToken: () => cookies.remove( "auth_token" ),

    getResendTime: () => {
        const val = cookies.get( "otpResendTime" );
        return val ? parseInt( val ) : null;
    },
    setResendTime: ( time: number ) =>
        cookies.set( "otpResendTime", time.toString(), 1 / 24 / 30 ),
    clearResendTime: () => cookies.remove( "otpResendTime" ),
};