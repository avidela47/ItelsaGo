import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";

export const dynamic = "force-dynamic";

type Item = {
  _id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  rooms?: number;
  images: string[];
  propertyType: string;
  operationType: string;
  agency?: { logo?: string; plan?: "free" | "sponsor" | "premium"; name?: string } | null;
};

function badgeColor(plan?: string) {
  if (plan === "premium") return "#ffd700"; // dorado
  if (plan === "sponsor") return "#22d3ee"; // cian
  return "#444"; // free
}

export default async function Page() {
  await dbConnect();
  const docs = (await Listing.find({ "images.0": { $exists: true, $ne: "" } })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean()) as Item[];

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <h1 className="text-2xl font-bold mb-4">Inmuebles</h1>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
        }}
      >
        <style>{`
          @media (min-width: 640px) { .grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
          @media (min-width: 1024px) { .grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        `}</style>

        <div className="grid-2 grid-3" style={{ display: "grid", gap: 16 }}>
          {docs.map((it) => {
            const first = it.images?.[0] || "";
            const priceFmt =
              it.currency === "ARS"
                ? `ARS ${Number(it.price).toLocaleString("es-AR")}`
                : `${it.currency} ${Number(it.price).toLocaleString("en-US")}`;

            return (
              <a
                key={it._id}
                href={`/inmuebles/${it._id}`}
                style={{
                  display: "block",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,.1)",
                  background: "rgba(255,255,255,.05)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                {/* Imagen principal con overlay de logo y badge */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#111" }}>
                  {first ? (
                    <img
                      src={first}
                      alt={it.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,255,255,.6)",
                      }}
                    >
                      Sin imagen
                    </div>
                  )}

                  {/* ✅ Logo inmobiliaria (si existe) */}
                  {it.agency?.logo && (
                    <div
                      style={{
                        position: "absolute",
                        left: 8,
                        bottom: 8,
                        background: "rgba(0,0,0,.5)",
                        borderRadius: 8,
                        padding: 6,
                        border: "1px solid rgba(255,255,255,.15)",
                      }}
                    >
                      <img
                        src={it.agency.logo}
                        alt="Logo inmobiliaria"
                        style={{ height: 28, width: "auto", display: "block" }}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* ✅ Badge de plan */}
                  {it.agency?.plan && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontSize: 12,
                        fontWeight: 800,
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: badgeColor(it.agency.plan),
                        color: "#111",
                        border: it.agency.plan === "premium" ? "1px solid rgba(0,0,0,.2)" : "none",
                      }}
                    >
                      {it.agency.plan.toUpperCase()}
                    </span>
                  )}
                </div>

                <div style={{ padding: 12 }}>
                  <h2 style={{ fontWeight: 600, lineHeight: 1.2 }}>{it.title}</h2>
                  <div style={{ fontSize: 14, opacity: 0.75 }}>{it.location}</div>
                  <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700 }}>{priceFmt}</div>
                  <div style={{ marginTop: 4, fontSize: 14, opacity: 0.85 }}>
                    {it.propertyType?.toUpperCase()} • {it.operationType?.toUpperCase()}
                    {typeof it.rooms === "number" ? ` • ${it.rooms} amb` : ""}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
}



