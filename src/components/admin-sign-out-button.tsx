"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { authClient } from "@/src/lib/auth/client";

export function AdminSignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError("Sign out failed. Please try again.");
        return;
      }
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("Sign out failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-sign-out">
      <Button variant="outline" type="button" isDisabled={busy} onPress={signOut}>
        {busy ? "Signing out..." : "Sign out"}
      </Button>
      {error ? <p className="admin-error" role="alert">{error}</p> : null}
    </div>
  );
}
