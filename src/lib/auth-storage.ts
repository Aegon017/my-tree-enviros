import { cookies } from "./cookies";
import type { User } from "@/types/auth.types";

/**
 * Auth Storage for Sanctum SPA Authentication
 * Note: For SPA auth, we don't store tokens manually.
 * Laravel Sanctum handles session cookies automatically (httpOnly).
 * We only store non-sensitive data like user info and OTP resend timer.
 */
export const authStorage = {
  // User data storage (client-side, non-sensitive)
  getUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  clearUser: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  },

  // OTP resend timer storage
  getResendTime: (): number | null => {
    const val = cookies.get("otpResendTime");
    return val ? parseInt(val, 10) : null;
  },

  setResendTime: (time: number) => {
    cookies.set("otpResendTime", time.toString(), 1 / 24 / 30); // 2 minutes
  },

  clearResendTime: () => {
    cookies.remove("otpResendTime");
  },

  // Clear all auth data
  clearAll: () => {
    authStorage.clearUser();
    authStorage.clearResendTime();
  },
};
