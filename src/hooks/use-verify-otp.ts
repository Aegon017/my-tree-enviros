import { useCallback } from "react";
import { toast } from "sonner";
import { authService } from "@/services/auth.services";
import type { VerifyOtpPayload } from "@/types/auth.types";

export function useVerifyOtp(onSuccess?: (user: any) => void) {
  const verify = useCallback(
    async (payload: VerifyOtpPayload) => {
      const res = await authService.verifyOtp(payload);

      if (res.success && res.data?.user) {
        onSuccess?.(res.data.user);
        toast.success("OTP verified successfully");
        return res.data.user;
      }

      toast.error(res.message ?? "OTP verification failed");
      return null;
    },
    [onSuccess],
  );

  return { verify };
}
