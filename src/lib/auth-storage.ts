import { cookies } from "./cookies";
import type { User } from "@/types/auth.types";


export const authStorage = {
  
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("user");
  },

  
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

  
  getResendTime: (): number | null => {
    const val = cookies.get("otpResendTime");
    return val ? parseInt(val, 10) : null;
  },

  setResendTime: (time: number) => {
    cookies.set("otpResendTime", time.toString(), 1 / 24 / 30); 
  },

  clearResendTime: () => {
    cookies.remove("otpResendTime");
  },

  
  clearAll: () => {
    authStorage.clearUser();
    authStorage.clearResendTime();
  },
};
