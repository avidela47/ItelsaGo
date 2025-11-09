import FiltersBar from "@/components/FiltersBar";
import Image from "next/image";

type Item = {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  rooms?: number;
  images?: string[];
  propertyType?: string;
  operationType?: string;
  agency?: { id: string; name: string; plan?: string } | null;
};

export const dynamic = "force-dynamic";

async function fetchList(params: Record<string, string | string[] | undefined>) {
  const q = new URLSearchParams();
  const allow = [
    "q",
    "operationType",
    "propertyType",
    "priceMin",
    "priceMax",
    "page",
    "pageSize",
    "sort",
  ] as const;

  for (const k of allow) {
    const v = params[k];
    if (typeof v === "string" && v) q.set(k, v);
  }
  if (!q.has("pageSize")) q.set("pageSize", "9");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/listings?` + q.toString(),
    { cache: "no-store", next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error("Error al cargar listados");
  return res.json() as Promise<{
    items: Item[];
    page: number;
    pages: number;
    pageSize: number;
    total: number;
    sort: string;
  }>;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { items } = await fetchList(searchParams);

  return (
    <main className="mx-auto max-w-7xl p-4">
      <h1 className="text-2xl font-bold mb-4">Inmuebles</h1>
      <FiltersBar />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const href = `/inmuebles/${it.id}`;
          const priceFmt =
            it.currency === "ARS"
              ? `ARS ${Number(it.price).toLocaleString("es-AR")}`
              : `${it.currency} ${Number(it.price).toLocaleString("en-US")}`;
          const firstImg =
            Array.isArray(it.images) && it.images[0] ? it.images[0] : "";

          return (
            <a
              key={it.id}
              href={href}
              className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              {/* Imagen con ratio fijo, SIN desborde */}
              <div className="relative w-full aspect-[16/9]">
                {firstImg ? (
                  <Image
                    src={firstImg}
                    alt={it.title}
                    fill
                    sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                    quality={100}
                    priority={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/20">
                    <span className="text-white/60 text-sm">Sin imagen</span>
                  </div>
                )}

                {!!it.agency?.plan && it.agency.plan !== "free" && (
                  <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded bg-yellow-300 text-black">
                    {it.agency.plan === "premium" ? "Destacado" : "Sponsor"}
                  </span>
                )}
              </div>

              <div className="p-3">
                <h2 className="font-semibold leading-tight">{it.title}</h2>
                <div className="text-sm text-white/70">{it.location}</div>
                <div className="mt-2 text-lg font-bold">{priceFmt}</div>
                <div className="mt-1 text-sm text-white/80">
                  {it.propertyType?.toUpperCase()} •{" "}
                  {it.operationType?.toUpperCase()}
                  {typeof it.rooms === "number" ? ` • ${it.rooms} amb` : ""}
                </div>
                {it.agency?.name && (
                  <div className="mt-2 text-xs text-white/70">
                    by {it.agency.name}
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </div>

      {items.length === 0 && (
        <p className="mt-3">No hay datos con esos filtros.</p>
      )}
    </main>
  );
}
