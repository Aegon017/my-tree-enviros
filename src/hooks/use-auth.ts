import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
    const token = useAuthStore( ( s ) => s.token );
    const user = useAuthStore( ( s ) => s.user );

    return {
        isAuthenticated: !!token,
        user,
        signOut: () => authService.signOut(),
    };
}