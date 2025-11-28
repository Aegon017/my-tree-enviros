"use client";

import { authStorage } from "@/lib/auth-storage";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  useEffect(() => {
    if (token) {
      authStorage.setToken(token);
      router.push("/");
    }
  }, [token]);

  return <p>Signing you in...</p>;
}
