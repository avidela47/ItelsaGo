"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export default function FiltersBar() {
  const router = useRouter();
  const sp = useSearchParams();

  const state = useMemo(
    () => ({
      q: sp.get("q") || "",
      operationType: sp.get("operationType") || "",
      propertyType: sp.get("propertyType") || "",
      priceMin: sp.get("priceMin") || "",
      priceMax: sp.get("priceMax") || "",
      sort: sp.get("sort") || "newest",
    }),
    [sp],
  );

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const params = new URLSearchParams();
      for (const [k, v] of fd.entries()) {
        const val = String(v).trim();
        if (val) params.set(k, val);
      }
      router.push(`/inmuebles?${params.toString()}`);
    },
    [router],
  );

  const onClear = useCallback(() => {
    router.push("/inmuebles");
  }, [router]);

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-2 md:grid-cols-6 bg-black/10 p-3 rounded-lg"
    >
      <input
        name="q"
        defaultValue={state.q}
        placeholder="Buscar (título/ubicación)"
        className="px-2 py-2 rounded border border-white/10 bg-black/20 md:col-span-2"
      />

      <select
        name="operationType"
        defaultValue={state.operationType}
        className="px-2 py-2 rounded border border-white/10 bg-black/20"
      >
        <option value="">Operación</option>
        <option value="venta">Venta</option>
        <option value="alquiler">Alquiler</option>
      </select>

      <select
        name="propertyType"
        defaultValue={state.propertyType}
        className="px-2 py-2 rounded border border-white/10 bg-black/20"
      >
        <option value="">Tipo</option>
        <option value="depto">Depto</option>
        <option value="casa">Casa</option>
        <option value="duplex">Dúplex</option>
        <option value="lote">Lote</option>
      </select>

      <div className="flex gap-2">
        <input
          name="priceMin"
          defaultValue={state.priceMin}
          placeholder="Min"
          className="w-full px-2 py-2 rounded border border-white/10 bg-black/20"
        />

        <input
          name="priceMax"
          defaultValue={state.priceMax}
          placeholder="Max"
          className="w-full px-2 py-2 rounded border border-white/10 bg-black/20"
        />
      </div>

      <select
        name="sort"
        defaultValue={state.sort}
        className="px-2 py-2 rounded border border-white/10 bg-black/20"
      >
        <option value="newest">Más nuevos</option>
        <option value="price_asc">Precio ↑</option>
        <option value="price_desc">Precio ↓</option>
      </select>

      <div className="flex gap-2 md:col-span-6">
        <button
          type="submit"
          className="px-3 py-2 rounded bg-white/10 hover:bg-white/20"
        >
          Aplicar
        </button>

        <button
          type="button"
          onClick={onClear}
          className="px-3 py-2 rounded bg-white/5 hover:bg-white/15"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}
