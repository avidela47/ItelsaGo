"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const next =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next") || "/"
      : "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, next }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        window.location.href = data.next || "/";
      } else {
        alert(data?.error || "No se pudo iniciar sesión");
      }
    } finally {
      setBusy(false);
    }
  }

  async function doLogout() {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) window.location.href = "/";
  }

  return (
    <main style={{ padding: "24px 16px", maxWidth: 420, margin: "0 auto" }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Ingresar</h1>
      <p style={{ opacity: 0.75, marginTop: 6 }}>Entrá con tu cuenta.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, opacity: 0.8 }}>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@tu-dominio.com"
            style={{
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.15)",
              color: "inherit",
              padding: "10px 12px",
              borderRadius: 10,
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, opacity: 0.8 }}>Contraseña</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.15)",
              color: "inherit",
              padding: "10px 12px",
              borderRadius: 10,
              outline: "none",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(0, 122, 255, 0.15)",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {busy ? "Entrando..." : "Entrar"}
        </button>

        <button
          type="button"
          onClick={doLogout}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.06)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>

        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
          Redirige a: <code>{next}</code>
        </div>
      </form>
    </main>
  );
}
