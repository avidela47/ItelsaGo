"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        alert(data?.info ? `${data.info}\nRegistrado con éxito.` : "Registrado con éxito.");
        window.location.href = "/login";
      } else {
        alert(data?.error || "No se pudo registrar");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: "24px 16px", maxWidth: 420, margin: "0 auto" }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Crear cuenta</h1>
      <p style={{ opacity: .75, marginTop: 6 }}>
        El <b>primer registro</b> del sistema queda como <b>ADMIN</b>. Luego, los siguientes serán <b>USER</b>.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, opacity: .8 }}>Nombre</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
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
          <span style={{ fontSize: 14, opacity: .8 }}>Email</span>
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
            background: "rgba(16, 185, 129, 0.18)",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {busy ? "Creando..." : "Crear cuenta"}
        </button>

        <div style={{ fontSize: 12, opacity: .7, marginTop: 6 }}>
          Luego entrá en <a href="/login">/login</a>
        </div>
      </form>
    </main>
  );
}
