// @ts-nocheck
import { headers } from "next/headers";
import ListingsGrid from "@/components/ListingsGrid";

export const dynamic = "force-dynamic";

type ListingItem = {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: "ARS" | "USD" | string;
  rooms?: number;
  images: string[];
  propertyType?: string;
  operationType?: string;
  agency?: { logo?: string; plan?: "free" | "sponsor" | "premium" } | null;
};

const PLAN_RANK: Record<string, number> = {
  premium: 0,
  sponsor: 1,
  free: 2,
  "": 3,
  undefined: 3,
  null: 3,
};

function paramsToString(p: URLSearchParams) {
  const s = p.toString();
  return s ? `?${s}` : "";
}

function getOriginServerSafe() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  try {
    const h = headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) return `${proto}://${host}`;
  } catch {}
  return "http://localhost:3000";
}

export default async function InmueblesPage({ searchParams }) {
  const origin = getOriginServerSafe();

  const q = (searchParams.q as string) || "";
  const propertyType = (searchParams.propertyType as string) || "";
  const operationType = (searchParams.operationType as string) || "";
  const currency = (searchParams.currency as string) || "";
  const priceMin = (searchParams.priceMin as string) || "";
  const priceMax = (searchParams.priceMax as string) || "";
  const page = Number(searchParams.page || 1) || 1;
  const pageSize = Number(searchParams.pageSize || 9) || 9;

  const apiParams = new URLSearchParams();
  if (q) apiParams.set("q", q);
  if (propertyType) apiParams.set("propertyType", propertyType);
  if (operationType) apiParams.set("operationType", operationType);
  if (currency) apiParams.set("currency", currency);
  if (priceMin) apiParams.set("priceMin", priceMin);
  if (priceMax) apiParams.set("priceMax", priceMax);
  apiParams.set("page", String(page));
  apiParams.set("pageSize", String(pageSize));

  const res = await fetch(`${origin}/api/listings${paramsToString(apiParams)}`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("No se pudo cargar el listado");

  const data = await res.json();
  let items: ListingItem[] = data?.items || [];

  // Orden server-side por plan y después precio desc
  items = items.slice().sort((a, b) => {
    const ra = PLAN_RANK[a?.agency?.plan ?? ""] ?? 3;
    const rb = PLAN_RANK[b?.agency?.plan ?? ""] ?? 3;
    if (ra !== rb) return ra - rb;
    return (b.price || 0) - (a.price || 0);
  });

  return (
    <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Inmuebles</h1>

        <div style={{ display: "flex", gap: 8 }}>
          <a
            href="/favoritos"
            style={{
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.12)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.06))",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Favoritos
          </a>
          <a
            href="/publicar"
            style={{
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.12)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.06))",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Publicar
          </a>
        </div>
      </div>

      {/* Grid con filtro "Solo favoritos" y brillos premium (client component) */}
      <ListingsGrid items={items} />
    </main>
  );
}










