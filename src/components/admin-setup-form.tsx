"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { AdminPasswordField } from "@/src/components/admin-password-field";
import { authClient } from "@/src/lib/auth/client";

export function AdminSetupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setUserId("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const result = await authClient.signUp.email({ email, password, name });
    if (result.error) setError(result.error.message ?? "Account creation failed.");
    else setUserId(result.data?.user?.id ?? "");
    setBusy(false);
  }

  return (
    <>
      <form className="admin-form login-form" onSubmit={submit}>
        <label>
          <span>Display name</span>
          <input
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label>
          <span>Email address</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <AdminPasswordField
          id="admin-setup-password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={8}
        />
        <AdminPasswordField
          id="admin-setup-confirm-password"
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          minLength={8}
        />
        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}
        {userId ? (
          <div className="admin-success" role="status">
            <p>
              Account created. Add this user ID to <code>admin_profiles</code>:
            </p>
            <code>{userId}</code>
          </div>
        ) : null}
        <Button variant="primary" isDisabled={busy} type="submit" className="login-submit">
          {busy ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="admin-auth-note">
        <a href="/admin/login">Back to admin sign in</a>
      </p>
    </>
  );
}
