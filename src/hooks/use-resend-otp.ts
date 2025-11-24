import { useCallback } from "react";
import { toast } from "sonner";
import { authService } from "@/services/auth.services";
import type { PhonePayload } from "@/types/auth.types";

export function useResendOtp(startTimer: () => void) {
  const resend = useCallback(
    async (payload: PhonePayload) => {
      const res = await authService.resendOtp(payload);

      if (res.success) {
        startTimer();
        toast.success("OTP resent successfully");
        return true;
      }

      toast.error(res.message ?? "Failed to resend OTP");
      return false;
    },
    [startTimer],
  );

  return { resend };
}
