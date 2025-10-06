"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { clearToken as clearTokenAction, setToken as setTokenAction } from "@/store/auth-slice";

export function useAuth() {
    const dispatch = useDispatch();
    const { token, isAuthenticated } = useSelector( ( state: RootState ) => state.auth );

    const login = useCallback( ( token: string ) => {
        dispatch( setTokenAction( token ) );
    }, [ dispatch ] );

    const logout = useCallback( () => {
        dispatch( clearTokenAction() );
    }, [ dispatch ] );

    return { token, isAuthenticated, login, logout };
}