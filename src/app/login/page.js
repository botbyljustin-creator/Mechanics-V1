"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const dest = params.get("from") || "/";
      router.replace(dest);
      router.refresh();
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-panel">
        <div className="login-header">
          <div className="wordmark">
            MECHANICS<span>_OS</span>
          </div>
          <div className="login-tagline">ENGINEERING THE BUSINESS</div>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="login-field">
            <label htmlFor="email">email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="login-submit" type="submit" disabled={busy}>
            {busy ? "SIGNING IN…" : "SIGN IN"}
          </button>
        </form>
      </div>
    </div>
  );
}
