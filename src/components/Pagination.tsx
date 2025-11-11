"use client";

import { useMemo } from "react";

type Props = {
  page: number;        // página actual (1..N)
  pageSize: number;    // items por página
  total: number;       // total de items
  basePath: string;    // ej: "/inmuebles"
  searchParams?: Record<string, string | number | undefined>;
};

function buildURL(base: string, params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export default function Pagination({ page, pageSize, total, basePath, searchParams = {} }: Props) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const canPrev = page > 1;
  const canNext = page < pages;

  // Ventana de páginas (estilo 1 .. n)
  const windowPages = useMemo(() => {
    const arr: number[] = [];
    const span = 2; // páginas a cada lado
    const start = Math.max(1, page - span);
    const end = Math.min(pages, page + span);
    for (let i = start; i <= end; i++) arr.push(i);
    if (!arr.includes(1)) arr.unshift(1);
    if (!arr.includes(pages)) arr.push(pages);
    return Array.from(new Set(arr)).sort((a, b) => a - b);
  }, [page, pages]);

  if (pages <= 1) return null;

  const baseParams = { ...searchParams, pageSize };

  return (
    <nav aria-label="Paginación" style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 16 }}>
      <a
        href={canPrev ? buildURL(basePath, { ...baseParams, page: page - 1 }) : "#"}
        aria-disabled={!canPrev}
        style={{
          pointerEvents: canPrev ? "auto" : "none",
          opacity: canPrev ? 1 : 0.5,
          padding: "8px 12px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,.14)",
          textDecoration: "none",
          background: "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.06))",
          fontWeight: 800,
          fontSize: 13,
        }}
      >
        ← Anterior
      </a>

      {windowPages.map((p, i) => {
        const active = p === page;
        const prev = windowPages[i - 1];
        // dibujar separador si hay salto
        const needsDots = prev && p - prev > 1;
        return (
          <span key={p} style={{ display: "flex", gap: 6 }}>
            {needsDots ? <span style={{ opacity: .6, padding: "8px 6px" }}>…</span> : null}
            <a
              href={buildURL(basePath, { ...baseParams, page: p })}
              aria-current={active ? "page" : undefined}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.14)",
                textDecoration: "none",
                background: active
                  ? "linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.10))"
                  : "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.06))",
                fontWeight: 900,
                fontSize: 13,
              }}
            >
              {p}
            </a>
          </span>
        );
      })}

      <a
        href={canNext ? buildURL(basePath, { ...baseParams, page: page + 1 }) : "#"}
        aria-disabled={!canNext}
        style={{
          pointerEvents: canNext ? "auto" : "none",
          opacity: canNext ? 1 : 0.5,
          padding: "8px 12px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,.14)",
          textDecoration: "none",
          background: "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.06))",
          fontWeight: 800,
          fontSize: 13,
        }}
      >
        Siguiente →
      </a>
    </nav>
  );
}

