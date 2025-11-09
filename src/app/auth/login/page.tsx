"use client";
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      window.location.href = "/panel";
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Ingresar</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginTop: 8 }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

        <label style={{ display: "block", marginTop: 8 }}>Contraseña</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

        <div style={{ marginTop: 12 }}>
          <button className="btn" type="submit" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</button>
        </div>
        {error && <p style={{ color: "#b00020" }}>{error}</p>}
      </form>
    </div>
  );
}
