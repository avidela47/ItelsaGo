"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Credenciales inválidas");
      }
      // Si el login fue OK, ya quedó la cookie de sesión/rol. Redirigimos:
      window.location.href = "/inmuebles";
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión");
    } finally {
      setBusy(false);
    }
  }

  async function entrarComoInvitado() {
    // opcional: rol "guest" para probar UX sin sesión
    const res = await fetch("/api/auth/login?guest=1", { method: "POST" });
    if (res.ok) window.location.href = "/inmuebles";
  }

  return (
    <main style={{ padding: "24px 16px", maxWidth: 420, margin: "0 auto" }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Iniciar sesión</h1>
      <p style={{ opacity: .75, marginTop: 6 }}>
        Ingresá con tu correo y contraseña. <br />
        Si aún no tenés cuenta, podés <a href="/register">registrarte aquí</a>.
      </p>

      {error && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            border: "1px solid rgba(255,0,0,.25)",
            background: "rgba(255,0,0,.08)",
            borderRadius: 10,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, opacity: .8 }}>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
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
          <span style={{ fontSize: 14, opacity: .8 }}>Contraseña</span>
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
            background: "rgba(59,130,246,.2)",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {busy ? "Ingresando..." : "Ingresar"}
        </button>

        <button
          type="button"
          onClick={entrarComoInvitado}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.06)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Entrar como invitado
        </button>
      </form>
    </main>
  );
}

