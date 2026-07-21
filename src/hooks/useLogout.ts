"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// POSTs through the same-origin /me/logout rewrite so the gateway's
// Set-Cookie (clearing klong_session) applies directly to the browser.
export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/me/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return { loading, logout };
}
