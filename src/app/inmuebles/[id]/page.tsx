// src/app/inmuebles/[id]/page.tsx
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import Gallery from "@/components/Gallery";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  await dbConnect();
  const id = params.id;

  const doc = await Listing.findById(id).lean().catch(() => null);
  if (!doc) return <main className="p-6">No encontrado</main>;

  const images: string[] = Array.isArray(doc.images)
    ? doc.images
        .filter(Boolean)
        .map((s: any) => String(s).trim())
        .filter(Boolean)
    : [];

  const priceFmt =
    doc.currency === "ARS"
      ? `ARS ${Number(doc.price).toLocaleString("es-AR")}`
      : `${doc.currency} ${Number(doc.price).toLocaleString("en-US")}`;

  const wpText = encodeURIComponent(
    `Hola, estoy interesado/a en la propiedad: ${doc.title}`
  );
  const wpHref = `https://wa.me/?text=${wpText}`;

  return (
    <main className="mx-auto max-w-5xl p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{doc.title}</h1>
        <div className="text-white/70">{doc.location}</div>
        <div className="mt-2 text-xl font-bold">{priceFmt}</div>
        <div className="text-sm text-white/80">
          {String(doc.propertyType).toUpperCase()} •{" "}
          {String(doc.operationType).toUpperCase()}
          {typeof doc.rooms === "number" ? ` • ${doc.rooms} amb` : ""}
        </div>
      </div>

      {/* Galería SIEMPRE contenida */}
      <div className="w-full max-w-5xl mx-auto">
        <Gallery images={images} title={doc.title} />
      </div>

      {doc.description && (
        <div className="whitespace-pre-wrap text-white/90">
          {doc.description}
        </div>
      )}

      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="font-semibold mb-2">Contacto</div>
        <a
          href={wpHref}
          target="_blank"
          className="block text-center px-4 py-2 rounded bg-green-600 hover:bg-green-700 font-semibold"
        >
          WhatsApp
        </a>
      </div>
    </main>
  );
}










