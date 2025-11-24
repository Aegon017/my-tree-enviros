import { authService } from "@/services/auth.services";
import { useAuthStore } from "@/store/auth-store";
import { useState, useEffect } from "react";

export function useAuth() {
    const token = useAuthStore((s) => s.token);
    const user = useAuthStore((s) => s.user);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return {
            isAuthenticated: false,
            user: null,
            signOut: () => authService.signOut(),
        };
    }

    return {
        isAuthenticated: !!token,
        user,
        signOut: () => authService.signOut(),
    };
}