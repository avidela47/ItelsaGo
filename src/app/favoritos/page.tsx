"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: "ARS" | "USD" | string;
  images: string[];
  agency?: { logo?: string; plan?: "free" | "sponsor" | "premium" } | null;
};

const KEY = "itelsa:favs";

function money(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "ARS",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString("es-AR")}`;
  }
}

export default function FavoritosPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [items, setItems] = useState<Item[] | null>(null);

  // leer favoritos
  useEffect(() => {
    try {
      const map = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, true>;
      setIds(Object.keys(map));
    } catch {
      setIds([]);
    }
  }, []);

  // traer items
  useEffect(() => {
    if (!ids.length) {
      setItems([]);
      return;
    }
    let ok = true;
    (async () => {
      try {
        const results: Item[] = [];
        for (const id of ids) {
          const res = await fetch(`/api/listings/${id}`, { cache: "no-store" });
          const data = await res.json();
          if (res.ok && data?.item) {
            const it = data.item;
            results.push({
              id: String(it.id),
              title: it.title,
              location: it.location,
              price: it.price,
              currency: it.currency,
              images: Array.isArray(it.images) ? it.images : [],
              agency: it.agency || null,
            });
          }
        }
        if (ok) setItems(results);
      } catch {
        if (ok) setItems([]);
      }
    })();
    return () => { ok = false; };
  }, [ids]);

  const empty = useMemo(() => (items && items.length === 0), [items]);

  // quitar favorito
  function toggleFav(id: string) {
    const map = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, true>;
    if (map[id]) delete map[id];
    else map[id] = true;
    localStorage.setItem(KEY, JSON.stringify(map));
    setIds(Object.keys(map));
    // feedback rápido: si quitamos, desaparece
    setItems((prev) => (prev ? prev.filter((x) => x.id !== id) : prev));
  }

  return (
    <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Favoritos</h1>
        <Link
          href="/inmuebles"
          style={{
            textDecoration: "none",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.12)",
            background: "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.06))",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Volver al listado
        </Link>
      </div>

      {items === null ? (
        <div style={{ padding: 24, opacity: .8 }}>Cargando favoritos…</div>
      ) : empty ? (
        <div
          style={{
            padding: 24,
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 12,
            opacity: 0.8,
            textAlign: "center",
          }}
        >
          No tenés favoritos guardados.
        </div>
      ) : (
        <section
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {items!.map((x) => {
            const img = (x.images || [])[0] || "/placeholder.png";
            return (
              <div
                key={x.id}
                style={{
                  display: "grid",
                  gap: 10,
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 12,
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02))",
                }}
              >
                {/* Imagen */}
                <div style={{ position: "relative", paddingTop: "62%", background: "rgba(255,255,255,.04)" }}>
                  <img
                    src={img}
                    alt={x.title}
                    loading="lazy"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />

                  {/* Logo agencia abajo-izquierda */}
                  {x.agency?.logo ? (
                    <img
                      src={x.agency.logo}
                      alt="agencia"
                      style={{
                        position: "absolute",
                        left: 8,
                        bottom: 8,
                        width: 28,
                        height: 28,
                        objectFit: "contain",
                        borderRadius: 6,
                        background: "rgba(255,255,255,.8)",
                        padding: 2,
                        border: "1px solid rgba(0,0,0,.15)",
                      }}
                    />
                  ) : null}

                  {/* Plan arriba-derecha */}
                  {x.agency?.plan ? (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "4px 8px",
                        borderRadius: 999,
                        background:
                          x.agency.plan === "premium"
                            ? "#ffd54d"
                            : x.agency.plan === "sponsor"
                            ? "#22d3ee"
                            : "#b0bec5",
                        color: "#0b0b0f",
                        border: "1px solid rgba(0,0,0,.15)",
                      }}
                    >
                      {x.agency.plan.toUpperCase()}
                    </span>
                  ) : null}

                  {/* Botón quitar / agregar */}
                  <button
                    onClick={() => toggleFav(x.id)}
                    title="Quitar de favoritos"
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      border: "1px solid rgba(0,0,0,.25)",
                      background: "rgba(255, 0, 80, .9)",
                      color: "white",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    ♥
                  </button>
                </div>

                {/* Contenido */}
                <div style={{ padding: "10px 12px", display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{money(x.price, x.currency)}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, minHeight: 34 }}>{x.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{x.location}</div>

                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <Link
                      href={`/inmuebles/${x.id}`}
                      style={{
                        textDecoration: "none",
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,.12)",
                        background: "rgba(255,255,255,.06)",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
