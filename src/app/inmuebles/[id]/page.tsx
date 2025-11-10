// @ts-nocheck
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import ShareButton from "../../../components/ShareButton";

export const dynamic = "force-dynamic";

type Item = {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: "ARS" | "USD" | string;
  rooms?: number;
  images: string[];
  description?: string;
  propertyType?: string;
  operationType?: string;
  agency?: { logo?: string; plan?: "free" | "sponsor" | "premium"; name?: string } | null;
  createdAt?: string;
};

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

function getOrigin() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  try {
    const h = headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) return `${proto}://${host}`;
  } catch {}
  return "http://localhost:3000";
}

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const origin = getOrigin();

  const res = await fetch(`${origin}/api/listings/${params.id}`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    if (res.status === 404) return notFound();
    throw new Error("No se pudo cargar el inmueble");
  }

  const data = await res.json();
  const item: Item | undefined = data?.item;
  if (!item) return notFound();

  const imgs = (item.images || []).filter(Boolean);
  const main = imgs[0] || "/placeholder.png";
  const canonicalUrl = `${origin}/inmuebles/${params.id}`;

  return (
    <main
      style={{
        padding: "24px 16px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>
        <a href="/inmuebles" style={{ textDecoration: "none", color: "inherit", opacity: 0.8 }}>
          Inmuebles
        </a>{" "}
        › <span style={{ opacity: 0.9 }}>Detalle</span>
      </div>

      <header
        style={{
          display: "grid",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{item.title}</h1>
        <div style={{ fontSize: 14, opacity: 0.9 }}>{item.location}</div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 0.2,
            }}
          >
            {money(item.price, item.currency)}
          </div>

          {item.propertyType && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.1)",
                background: "rgba(255,255,255,.05)",
              }}
            >
              {item.propertyType.toUpperCase()}
            </span>
          )}

          {item.operationType && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.1)",
                background: "rgba(255,255,255,.05)",
              }}
            >
              {item.operationType.toUpperCase()}
            </span>
          )}

          {typeof item.rooms === "number" && item.rooms > 0 && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.1)",
                background: "rgba(255,255,255,.05)",
              }}
            >
              {item.rooms} amb.
            </span>
          )}

          {/* ✅ LOGO GRANDE */}
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {item.agency?.logo ? (
              <img
                src={item.agency.logo}
                alt="logo agencia"
                style={{
                  width: 44,
                  height: 44,
                  objectFit: "contain",
                  borderRadius: 10,
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(255,255,255,.08)",
                }}
              />
            ) : null}

            {item.agency?.plan ? (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background:
                    item.agency.plan === "premium"
                      ? "#ffd54d"
                      : item.agency.plan === "sponsor"
                      ? "#22d3ee"
                      : "#b0bec5",
                  color: "#0b0b0f",
                  border: "1px solid rgba(0,0,0,.15)",
                }}
                title={`Plan: ${item.agency.plan}`}
              >
                {item.agency.plan.toUpperCase()}
              </span>
            ) : null}
          </span>
        </div>
      </header>

      {/* GALERÍA */}
      <section
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "1fr",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            position: "relative",
            paddingTop: "56.25%",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.03)",
          }}
        >
          <img
            src={main}
            alt={item.title}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {imgs.length > 1 && (
          <div
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: "repeat(6, 1fr)",
            }}
          >
            {imgs.slice(0, 12).map((src, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  paddingTop: "66%",
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,.1)",
                  background: "rgba(255,255,255,.03)",
                }}
              >
                <img
                  src={src}
                  alt={`thumb-${i}`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DESCRIPCIÓN + BOTONES */}
      <section
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "1fr",
          marginBottom: 28,
        }}
      >
        {item.description && (
          <article
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.12)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02))",
              padding: 16,
              lineHeight: 1.5,
              fontSize: 15,
              whiteSpace: "pre-wrap",
            }}
          >
            {item.description}
          </article>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hola, me interesa este inmueble: ${item.title} (${money(
                item.price,
                item.currency
              )}) - ${canonicalUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.12)",
              background: "rgba(37, 211, 102, 0.12)",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Consultar por WhatsApp
          </a>

          <ShareButton
            url={canonicalUrl}
            title={item.title}
            priceText={money(item.price, item.currency)}
          />

          <a
            href={`/inmuebles/${params.id}/editar`}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.12)",
              background: "rgba(255,255,255,.06)",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Editar
          </a>
        </div>
      </section>
    </main>
  );
}




