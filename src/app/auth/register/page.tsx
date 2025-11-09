"use client";
import React, { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, contactEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      // redirect to panel
      window.location.href = "/panel";
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2>Registrar inmobiliaria</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginTop: 8 }}>Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label style={{ display: "block", marginTop: 8 }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

        <label style={{ display: "block", marginTop: 8 }}>Contraseña</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

        <label style={{ display: "block", marginTop: 8 }}>Teléfono (opcional)</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />

        <label style={{ display: "block", marginTop: 8 }}>Email de contacto (opcional)</label>
        <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />

        <div style={{ marginTop: 12 }}>
          <button className="btn" type="submit" disabled={loading}>{loading ? "Creando..." : "Crear cuenta"}</button>
        </div>
        {error && <p style={{ color: "#b00020" }}>{error}</p>}
      </form>
    </div>
  );
}
