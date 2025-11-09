"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PublicarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title") || "").trim(),
      description: String(fd.get("description") || "").trim(),
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

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(json?.error || "Error");
      return;
    }
    router.push(json.href || `/inmuebles/${json.id}`);
  }

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-semibold">Publicar inmueble</h1>

      <form onSubmit={onSubmit} className="grid gap-3">
        <input name="title" placeholder="Título" className="px-3 py-2 rounded bg-black/20 border border-white/10" required />
        <input name="location" placeholder="Ubicación" className="px-3 py-2 rounded bg-black/20 border border-white/10" required />
        <div className="grid grid-cols-2 gap-3">
          <input name="price" type="number" placeholder="Precio" className="px-3 py-2 rounded bg-black/20 border border-white/10" required />
          <input name="currency" defaultValue="USD" placeholder="Moneda (USD/ARS)" className="px-3 py-2 rounded bg-black/20 border border-white/10" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input name="rooms" type="number" placeholder="Ambientes" className="px-3 py-2 rounded bg-black/20 border border-white/10" />
          <select name="propertyType" className="px-3 py-2 rounded bg-black/20 border border-white/10" required>
            <option value="">Tipo</option>
            <option value="depto">Depto</option>
            <option value="casa">Casa</option>
            <option value="lote">Lote</option>
            <option value="local">Local</option>
          </select>
          <select name="operationType" className="px-3 py-2 rounded bg-black/20 border border-white/10" required>
            <option value="">Operación</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
            <option value="temporario">Temporario</option>
          </select>
        </div>
        <textarea name="description" placeholder="Descripción" rows={4} className="px-3 py-2 rounded bg-black/20 border border-white/10" />
        <textarea
          name="images"
          placeholder={"URLs de imágenes (una por línea o separadas por coma)"}
          rows={4}
          className="px-3 py-2 rounded bg-black/20 border border-white/10"
        />
        <button
          disabled={loading}
          className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50"
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </form>
    </main>
  );
}
