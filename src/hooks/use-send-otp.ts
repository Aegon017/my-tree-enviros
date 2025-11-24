import { useCallback } from "react";
import { toast } from "sonner";
import { authService } from "@/services/auth.services";
import { authStorage } from "@/lib/auth-storage";
import type { PhonePayload } from "@/types/auth.types";

export function useSendOtp(callback?: (payload: PhonePayload) => void) {
  const sendOtp = useCallback(
    async (payload: PhonePayload) => {
      const res = await authService.signIn(payload);

      if (res.success) {
        authStorage.setResendTime(Date.now() + 60000);
        toast.success(res.message ?? "Verification code sent successfully");
        callback?.(payload);
      } else {
        toast.error(res.message ?? "Failed to send verification code");
      }

      return res;
    },
    [callback],
  );

  return { sendOtp };
}
