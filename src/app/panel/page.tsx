"use client";
import React, { useEffect, useState } from "react";

export default function PanelPage() {
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("No autorizado");
        const j = await res.json();
        if (j?.ok) setAgency(j.agency);
      } catch (err) {
        setAgency(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (!agency) return (
    <div>
      <p>No estás autenticado.</p>
      <a href="/auth/login" className="btn">Ingresar</a>
    </div>
  );

  return (
    <div>
      <h2>Panel de {agency.name}</h2>
      {agency.logoUrl && <img src={agency.logoUrl} alt="logo" style={{ maxWidth: 120 }} />}
      <p>Plan: {agency.plan}</p>
      <div style={{ marginTop: 12 }}>
        <a className="btn" href="/publicar">Crear nueva publicación</a>
      </div>
      <div style={{ marginTop: 16 }}>
        <a className="btn" href="/inmuebles">Ver sitio público</a>
      </div>
    </div>
  );
}
