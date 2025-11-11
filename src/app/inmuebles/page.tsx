"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

import FiltersBar, {
  FilterState,
  SortKey,
  Plan,
  PropertyType,
} from "@/components/FiltersBar";
import PropertyCard from "@/components/cards/PropertyCard";

type Item = {
  _id: string;
  title: string;
  price: number;
  currency: "ARS" | "USD";
  location: string;
  images: string[];
  rooms?: number;
  propertyType?: "depto" | "casa" | "lote" | "local";
  agency?: { logo?: string; plan?: "premium" | "sponsor" | "free" };
  createdAt?: string;
};

export default function InmueblesPage() {
  const [loading, setLoading] = useState(true);
  const [itemsAll, setItemsAll] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const base = process.env.NEXT_PUBLIC_BASE_URL || "";
        const res = await fetch(`${base}/api/listings`, {
          cache: "no-store",
          next: { revalidate: 0 },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "No se pudo cargar");
        if (!ok) return;
        setItemsAll(Array.isArray(data?.items) ? data.items : []);
      } catch (err: any) {
        setError(err?.message || "Error de red");
      } finally {
        setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, []);

  const [initialMin, initialMax] = useMemo(() => {
    const prices = itemsAll.map((i) => i.price || 0).filter((n) => n > 0);
    return [
      prices.length ? Math.min(...prices) : 0,
      prices.length ? Math.max(...prices) : 1000000,
    ];
  }, [itemsAll]);

  const [filters, setFilters] = useState<FilterState>({
    q: "",
    sort: "recent",
    plan: "all",
    location: "all",
    type: "all",
    price: [0, 1000000],
    rooms: "all",
  });

  useEffect(() => {
    setFilters((f) => {
      const isDefault = f.price[0] === 0 && f.price[1] === 1000000;
      return isDefault ? { ...f, price: [initialMin, initialMax] } : f;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMin, initialMax]);

  const list = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    let out = itemsAll.filter((it) => {
      const hay = (it.title || "").toLowerCase();
      const loc = (it.location || "").toLowerCase();
      const matchQ = !q || hay.includes(q) || loc.includes(q);

      const plan: Plan = (it.agency?.plan as Plan) || "free";
      const matchPlan = filters.plan === "all" || plan === filters.plan;

      const matchLoc = filters.location === "all" || it.location === filters.location;

      const t: PropertyType = (it.propertyType as PropertyType) || "all";
      const matchType = filters.type === "all" || t === filters.type;

      const rooms = typeof it.rooms === "number" ? it.rooms : undefined;
      const matchRooms = filters.rooms === "all" ? true : rooms === Number(filters.rooms);

      const p = Number(it.price || 0);
      const matchPrice = p >= filters.price[0] && p <= filters.price[1];

      return matchQ && matchPlan && matchLoc && matchType && matchRooms && matchPrice;
    });

    const sort: SortKey = filters.sort;
    out.sort((a, b) => {
      if (sort === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sort === "price_desc") return (b.price || 0) - (a.price || 0);
      if (sort === "rooms_desc") return (b.rooms || 0) - (a.rooms || 0);
      const da = a.createdAt ? Date.parse(a.createdAt) : 0;
      const db = b.createdAt ? Date.parse(b.createdAt) : 0;
      return db - da;
    });

    return out;
  }, [itemsAll, filters]);

  return (
    <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Filtros arriba */}
      <FiltersBar value={filters} onChange={setFilters} items={itemsAll} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ my: 3 }}>
          {error}
        </Typography>
      ) : list.length === 0 ? (
        <Typography sx={{ opacity: 0.8, my: 3 }}>
          No hay resultados con los filtros aplicados.
        </Typography>
      ) : (
        /* 4 por fila en lg; 3 md; 2 sm; 1 xs */
        <Box
          sx={{
            mt: 2,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
            alignItems: "stretch",
          }}
        >
          {list.map((it) => (
            <PropertyCard key={it._id} item={it} />
          ))}
        </Box>
      )}

      {/* Solo admins ven el botón Publicar; si querés, sacalo de acá */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button href="/publicar" variant="contained">Publicar</Button>
      </Box>
    </main>
  );
}
