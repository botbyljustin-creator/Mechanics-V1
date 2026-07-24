"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, User } from "lucide-react";

const ROLE_LABEL = {
  ADMIN: "ADMIN",
  LEADERSHIP: "LEADERSHIP",
  DEPT_HEAD: "DEPT HEAD",
};

export function AccountMenu({ user }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="account-pill">
      <button className="account-btn" onClick={() => setOpen((v) => !v)}>
        <User size={13} strokeWidth={1.75} />
        <span>{user.name}</span>
        <span className="account-role">{ROLE_LABEL[user.role] || user.role}</span>
      </button>
      {open && (
        <div className="account-menu" onMouseLeave={() => setOpen(false)}>
          <button
            className="account-menu-item"
            onClick={() => {
              setShowChangePassword(true);
              setOpen(false);
            }}
          >
            <KeyRound size={13} /> Change password
          </button>
          <div className="account-menu-divider" />
          <button className="account-menu-item" onClick={logout}>
            <LogOut size={13} /> Log out
          </button>
        </div>
      )}
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not change password.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Could not change password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          <span>CHANGE PASSWORD</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {success ? (
          <>
            <div className="login-field" style={{ color: "var(--green)", fontSize: 12.5 }}>
              Password updated.
            </div>
            <button className="login-submit" onClick={onClose}>
              Done
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            {error && <div className="login-error">{error}</div>}
            <div className="login-field">
              <label>current password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="login-field">
              <label>new password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            </div>
            <div className="login-field">
              <label>confirm new password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
            </div>
            <button className="login-submit" type="submit" disabled={busy}>
              {busy ? "SAVING…" : "SAVE"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
