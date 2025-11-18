import { create } from "zustand";

type User = any;

type AuthState = {
    token: string | null;
    user: User | null;
    setToken: ( token: string | null ) => void;
    setUser: ( user: User | null ) => void;
    clearAuth: () => void;
};

export const useAuthStore = create<AuthState>( ( set ) => ( {
    token: null,
    user: null,
    setToken( token ) {
        set( { token } );
    },
    setUser( user ) {
        set( { user } );
    },
    clearAuth() {
        set( { token: null, user: null } );
    },
} ) );