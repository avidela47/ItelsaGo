// src/app/inmuebles/[id]/page.tsx
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import Gallery from "@/components/Gallery";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  await dbConnect();
  const id = params.id;

  const doc = await Listing.findById(id).lean().catch(() => null);
  if (!doc) return <main style={{ padding: 24 }}>No encontrado</main>;

  const images: string[] = Array.isArray(doc.images)
    ? doc.images.filter(Boolean).map((s: any) => String(s).trim()).filter(Boolean)
    : [];

  const priceFmt =
    doc.currency === "ARS"
      ? `ARS ${Number(doc.price).toLocaleString("es-AR")}`
      : `${doc.currency} ${Number(doc.price).toLocaleString("en-US")}`;

  const wpText = encodeURIComponent(`Hola, estoy interesado/a en la propiedad: ${doc.title}`);
  const wpHref = `https://wa.me/?text=${wpText}`;

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>{doc.title}</h1>
        <div style={{ opacity: 0.75 }}>{doc.location}</div>
        <div style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>{priceFmt}</div>
        <div style={{ marginTop: 4, opacity: 0.85 }}>
          {String(doc.propertyType).toUpperCase()} • {String(doc.operationType).toUpperCase()}
          {typeof doc.rooms === "number" ? ` • ${doc.rooms} amb` : ""}
        </div>
      </div>

      {/* Galería controlada */}
      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
        <Gallery images={images} title={doc.title} />
      </div>

      {doc.description && (
        <div style={{ marginTop: 16, whiteSpace: "pre-wrap", opacity: 0.95 }}>
          {doc.description}
        </div>
      )}

      <div style={{ marginTop: 16, padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)" }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Contacto</div>
        <a
          href={wpHref}
          target="_blank"
          style={{
            display: "block",
            textAlign: "center",
            padding: "10px 16px",
            borderRadius: 10,
            background: "#16a34a",
            color: "#fff",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          WhatsApp
        </a>
      </div>
    </main>
  );
}










