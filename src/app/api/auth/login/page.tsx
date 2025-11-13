"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.error || "Error");
      } else {
        window.location.href = "/"; // o /panel si querés
      }
    } catch {
      setMsg("Error de red");
    } finally {
      setBusy(false);
    }
  }

  async function guest() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/login?guest=1", { method: "POST" });
      if (!res.ok) setMsg("No se pudo entrar como invitado");
      else window.location.href = "/";
    } catch {
      setMsg("Error de red");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ margin: 0, marginBottom: 12 }}>Ingresar</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          placeholder="email@dominio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 8 }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 8 }}
        />
        <button type="submit" disabled={busy} style={{ padding: 10, borderRadius: 8 }}>
          {busy ? "Ingresando..." : "Ingresar"}
        </button>
        <button type="button" onClick={guest} disabled={busy} style={{ padding: 10, borderRadius: 8 }}>
          Entrar como invitado
        </button>
        {msg && <div style={{ color: "salmon" }}>{msg}</div>}
      </form>
    </main>
  );
}
