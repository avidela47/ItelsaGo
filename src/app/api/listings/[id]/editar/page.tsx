"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Doc = {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  location: string;
  rooms?: number;
  propertyType: string;
  operationType: string;
  images?: string[];
};

export default function EditarInmueble() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [data, setData] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/listings/${id}`).then(async (r) => {
      const j = await r.json();
      setData(j);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <main className="p-6">Cargando…</main>;
  if (!data) return <main className="p-6">No encontrado</main>;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title") || "").trim(),
      description: String(fd.get("description") || ""),
      price: Number(fd.get("price") || 0),
      currency: String(fd.get("currency") || "USD").toUpperCase(),
      location: String(fd.get("location") || "").trim(),
      rooms: Number(fd.get("rooms") || 0),
      propertyType: String(fd.get("propertyType") || ""),
      operationType: String(fd.get("operationType") || ""),
      images: String(fd.get("images") || "")
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (!res.ok) {
      alert(j?.error || "Error");
      return;
    }
    router.push(`/inmuebles/${id}`);
  }

  async function onDelete() {
    if (!confirm("¿Eliminar este inmueble?")) return;
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/inmuebles");
  }

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-semibold">Editar inmueble</h1>

      <form onSubmit={onSubmit} className="grid gap-3">
        <input name="title" defaultValue={data.title} placeholder="Título" className="px-3 py-2 rounded bg-black/20 border border-white/10" required />
        <input name="location" defaultValue={data.location} placeholder="Ubicación" className="px-3 py-2 rounded bg-black/20 border border-white/10" required />
        <div className="grid grid-cols-2 gap-3">
          <input name="price" type="number" defaultValue={data.price} placeholder="Precio" className="px-3 py-2 rounded bg-black/20 border border-white/10" required />
          <input name="currency" defaultValue={data.currency || "USD"} placeholder="Moneda" className="px-3 py-2 rounded bg-black/20 border border-white/10" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input name="rooms" type="number" defaultValue={data.rooms ?? 0} placeholder="Ambientes" className="px-3 py-2 rounded bg-black/20 border border-white/10" />
          <select name="propertyType" defaultValue={data.propertyType} className="px-3 py-2 rounded bg-black/20 border border-white/10" required>
            <option value="">Tipo</option>
            <option value="depto">Depto</option>
            <option value="casa">Casa</option>
            <option value="lote">Lote</option>
            <option value="local">Local</option>
          </select>
          <select name="operationType" defaultValue={data.operationType} className="px-3 py-2 rounded bg-black/20 border border-white/10" required>
            <option value="">Operación</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
            <option value="temporario">Temporario</option>
          </select>
        </div>
        <textarea name="description" defaultValue={data.description || ""} placeholder="Descripción" rows={4} className="px-3 py-2 rounded bg-black/20 border border-white/10" />
        <textarea
          name="images"
          defaultValue={(data.images || []).join("\n")}
          placeholder="URLs de imágenes (una por línea o separadas por coma)"
          rows={4}
          className="px-3 py-2 rounded bg-black/20 border border-white/10"
        />
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">Guardar</button>
          <button type="button" onClick={onDelete} className="px-4 py-2 rounded bg-red-500/20 hover:bg-red-500/30">
            Eliminar
          </button>
        </div>
      </form>
    </main>
  );
}
