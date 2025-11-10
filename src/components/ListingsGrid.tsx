"use client";

import { useEffect, useMemo, useState } from "react";
import FavButton from "@/components/FavButton";

type ListingItem = {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: "ARS" | "USD" | string;
  images: string[];
  agency?: { logo?: string; plan?: "free" | "sponsor" | "premium" } | null;
};

const FAV_KEY = "itelsa:favs";

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

export default function ListingsGrid({ items }: { items: ListingItem[] }) {
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  // cargar favoritos del localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, true>) : {};
      setFavIds(new Set(Object.keys(map)));
    } catch {
      setFavIds(new Set());
    }
  }, []);

  // permitir que el usuario cambie el filtro
  function toggleOnlyFavs() {
    setOnlyFavs((v) => !v);
    // refresco favoritos por si cambiaron desde otra vista
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, true>) : {};
      setFavIds(new Set(Object.keys(map)));
    } catch {}
  }

  // filtrar si está activo "solo favoritos"
  const visible = useMemo(() => {
    if (!onlyFavs) return items;
    return items.filter((x) => favIds.has(x.id));
  }, [onlyFavs, favIds, items]);

  // contador
  const countFavs = favIds.size;

  return (
    <>
      {/* Toolbar filtro */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      >
        <button
          onClick={toggleOnlyFavs}
          type="button"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.14)",
            background: onlyFavs
              ? "linear-gradient(180deg, rgba(255,0,80,.18), rgba(255,0,80,.10))"
              : "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.06))",
            fontWeight: 800,
            fontSize: 13,
            cursor: "pointer",
          }}
          title="Mostrar solo favoritos"
          aria-pressed={onlyFavs}
        >
          {onlyFavs ? "♥ Solo favoritos" : `Favoritos (${countFavs})`}
        </button>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div
          style={{
            padding: 24,
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 12,
            opacity: 0.8,
            textAlign: "center",
          }}
        >
          {onlyFavs
            ? "No tenés favoritos guardados."
            : "No se encontraron publicaciones con esos filtros."}
        </div>
      ) : (
        <section
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {visible.map((x) => {
            const img = (x.images || [])[0] || "/placeholder.png";
            const isPremium = x.agency?.plan === "premium";
            const isSponsor = x.agency?.plan === "sponsor";

            return (
              <a
                key={x.id}
                href={`/inmuebles/${x.id}`}
                style={{
                  display: "grid",
                  gap: 10,
                  textDecoration: "none",
                  border: isPremium
                    ? "1px solid rgba(255, 213, 77, .85)"
                    : "1px solid rgba(255,255,255,.12)",
                  borderRadius: 12,
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02))",
                  // ✨ brillos para premium / sponsor
                  boxShadow: isPremium
                    ? "0 0 0 2px rgba(255,213,77,.25), 0 12px 36px rgba(0,0,0,.35)"
                    : isSponsor
                    ? "0 0 0 2px rgba(34,211,238,.18), 0 10px 30px rgba(0,0,0,.32)"
                    : "0 10px 28px rgba(0,0,0,.28)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    paddingTop: "62%",
                    background: "rgba(255,255,255,.04)",
                  }}
                >
                  <img
                    src={img}
                    alt={x.title}
                    loading="lazy"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "translateZ(0)",
                    }}
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

                  {/* Favorito */}
                  <div style={{ position: "absolute", top: 8, left: 8 }}>
                    <FavButton id={x.id} />
                  </div>
                </div>

                <div style={{ padding: "10px 12px", display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>
                    {money(x.price, x.currency)}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      minHeight: 34,
                    }}
                  >
                    {x.title}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{x.location}</div>
                </div>
              </a>
            );
          })}
        </section>
      )}
    </>
  );
}
