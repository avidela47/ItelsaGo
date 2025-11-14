"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import FiltersBar, {
  FilterState,
  SortKey,
  Plan,
  PropertyType,
} from "@/components/FiltersBar";
import PropertyCard from "@/components/cards/PropertyCard";
import PlanesSection from "@/components/PlanesSection";

type Item = {
  _id: string;
  title: string;
  price: number;
  currency: "ARS" | "USD";
  location: string;
  images: string[];
  rooms?: number;
  propertyType?: "depto" | "casa" | "lote" | "local";
  agency?: { logo?: string; plan?: "premium" | "sponsor" | "pro" | "free" };
  createdAt?: string;
};

export default function InmueblesPage() {
  const [loading, setLoading] = useState(true);
  const [itemsAll, setItemsAll] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPlanes, setShowPlanes] = useState(false);

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
    return () => {
      ok = false;
    };
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
  }, [initialMin, initialMax]);

  const list = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    let out = itemsAll.filter((it) => {
      const hay = (it.title || "").toLowerCase();
      const loc = (it.location || "").toLowerCase();
      const matchQ = !q || hay.includes(q) || loc.includes(q);

      // Normalizar sponsor -> pro para el filtrado
      const itemPlan = it.agency?.plan === "sponsor" ? "pro" : it.agency?.plan;
      const plan: Plan = (itemPlan as Plan) || "free";
      const matchPlan = filters.plan === "all" || plan === filters.plan;

      const matchLoc =
        filters.location === "all" || it.location === filters.location;

      const t: PropertyType = (it.propertyType as PropertyType) || "all";
      const matchType = filters.type === "all" || t === filters.type;

      const rooms =
        typeof it.rooms === "number" ? it.rooms : undefined;
      const matchRooms =
        filters.rooms === "all" ? true : rooms === Number(filters.rooms);

      const p = Number(it.price || 0);
      const matchPrice = p >= filters.price[0] && p <= filters.price[1];

      return (
        matchQ &&
        matchPlan &&
        matchLoc &&
        matchType &&
        matchRooms &&
        matchPrice
      );
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
    <main
      style={{
        padding: "0px 16px 24px",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >

      {/* FILTROS */}
      <FiltersBar
        value={filters}
        onChange={setFilters}
        items={itemsAll}
        onPlanesClick={() => setShowPlanes(true)}
      />

      {/* RESULTADOS */}
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
        <Box
          sx={{
            mt: 0,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {list.map((it) => (
            <PropertyCard key={it._id} item={it} />
          ))}
        </Box>
      )}

      {/* MODAL PLANES */}
      {showPlanes && <PlanesSection onClose={() => setShowPlanes(false)} />}
    </main>
  );
}
