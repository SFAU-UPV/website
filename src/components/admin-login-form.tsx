"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { AdminPasswordField } from "@/src/components/admin-password-field";
import { authClient } from "@/src/lib/auth/client";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await authClient.signIn.email({ email, password });
    if (result.error) setError(result.error.message ?? "Sign-in failed.");
    else window.location.href = "/admin";
    setBusy(false);
  }
  return (
    <>
      <form className="admin-form login-form" onSubmit={submit}>
        <label>
          <span>Email address</span>
          <input
            required
            type="email"
            autoComplete="email"
            placeholder="name@up.edu.ph"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <AdminPasswordField
          id="admin-login-password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="Enter your password"
        />
        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}
        <Button variant="primary" isDisabled={busy} type="submit" className="login-submit">
          {busy ? "Signing in..." : "Sign in to workspace"}
        </Button>
      </form>
      <p className="admin-auth-note">
        <a href="/admin/setup">Create the first admin account</a>
      </p>
    </>
  );
}
