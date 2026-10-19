"use client";

import { useState } from "react";
import { authClient } from "@/src/lib/auth/client";

export function AdminSetupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setUserId("");
    const result = await authClient.signUp.email({ email, password, name });
    if (result.error) setError(result.error.message ?? "Account creation failed.");
    else setUserId(result.data?.user?.id ?? "");
    setBusy(false);
  }

  return <>
    <form className="admin-form login-form" onSubmit={submit}>
      <label><span>Display name</span><input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label><span>Email address</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label><span>Password</span><input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      {userId ? <div className="admin-success" role="status"><p>Account created. Add this user ID to <code>admin_profiles</code>:</p><code>{userId}</code></div> : null}
      <button className="button button-primary login-submit" disabled={busy} type="submit">{busy ? "Creating account..." : "Create account"}</button>
    </form>
    <p className="admin-auth-note"><a href="/admin/login">Back to admin sign in</a></p>
  </>;
}
