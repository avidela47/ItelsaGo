


"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import FiltersBar, {
  FilterState,
  SortKey,
  Plan,
  PropertyType,
} from "@/components/FiltersBar";
import PropertyCard from "@/components/cards/PropertyCard";
import PlanesSection from "@/components/PlanesSection";
import SkeletonCard from "@/components/SkeletonCard";

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
  m2Total?: number;
  m2Cubiertos?: number;
  bedrooms?: number;
  bathrooms?: number;
  garage?: boolean;
};

export default function InmueblesPage() {
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [savingAlert, setSavingAlert] = useState(false);

  // Guardar búsqueda como alerta
  const handleSaveAlert = async () => {
    setSavingAlert(true);
    setAlertMsg(null);
    try {
      const res = await fetch("/api/user/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria: filters })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo guardar la alerta");
      setAlertMsg("¡Búsqueda guardada como alerta!");
    } catch (err: any) {
      setAlertMsg(err?.message || "Error al guardar alerta");
    } finally {
      setSavingAlert(false);
    }
  };
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
    m2Total: [0, 1000],
    m2Cubiertos: [0, 500],
    bedrooms: "all",
    bathrooms: "all",
    garage: "all",
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
        filters.rooms === "all" ? true : rooms !== undefined && rooms >= Number(filters.rooms);

      const bedrooms = typeof it.bedrooms === "number" ? it.bedrooms : undefined;
      const matchBedrooms =
        filters.bedrooms === "all" ? true : bedrooms !== undefined && bedrooms >= Number(filters.bedrooms);

      const bathrooms = typeof it.bathrooms === "number" ? it.bathrooms : undefined;
      const matchBathrooms =
        filters.bathrooms === "all" ? true : bathrooms !== undefined && bathrooms >= Number(filters.bathrooms);

      const matchGarage =
        filters.garage === "all"
          ? true
          : filters.garage === true
            ? it.garage === true
            : it.garage !== true;

      const p = Number(it.price || 0);
      const matchPrice = p >= filters.price[0] && p <= filters.price[1];

      const m2T = Number(it.m2Total || 0);
      const matchM2Total = m2T === 0 || (m2T >= filters.m2Total[0] && m2T <= filters.m2Total[1]);

      const m2C = Number(it.m2Cubiertos || 0);
      const matchM2Cubiertos = m2C === 0 || (m2C >= filters.m2Cubiertos[0] && m2C <= filters.m2Cubiertos[1]);

      return (
        matchQ &&
        matchPlan &&
        matchLoc &&
        matchType &&
        matchRooms &&
        matchBedrooms &&
        matchBathrooms &&
        matchGarage &&
        matchPrice &&
        matchM2Total &&
        matchM2Cubiertos
      );
    });

    const sort: SortKey = filters.sort;
    out.sort((a, b) => {
      if (sort === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sort === "price_desc") return (b.price || 0) - (a.price || 0);
      if (sort === "rooms_desc") return (b.rooms || 0) - (a.rooms || 0);
      if (sort === "m2_desc") return (b.m2Total || 0) - (a.m2Total || 0);

      const da = a.createdAt ? Date.parse(a.createdAt) : 0;
      const db = b.createdAt ? Date.parse(b.createdAt) : 0;
      return db - da;
    });

    return out;
  }, [itemsAll, filters]);

  // Structured data JSON-LD para SEO (ItemList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Listado de propiedades",
    "description": "Propiedades en venta y alquiler en Argentina. Filtrá por ubicación, precio, tipo y más.",
    "url": typeof window !== "undefined" ? window.location.href : "https://itelsa-go.com/inmuebles",
    "numberOfItems": list.length,
    "itemListElement": list.slice(0, 20).map((it, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `/inmuebles/${it._id}`,
      "name": it.title,
      ...(it.images?.[0] && { "image": it.images[0] }),
      ...(it.price && { "price": it.price, "priceCurrency": it.currency }),
      ...(it.location && { "address": it.location })
    }))
  };

  return (
    <main
      style={{
        padding: "0px 16px 24px",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* JSON-LD para Google (ItemList) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* FILTROS */}

      <FiltersBar
        value={filters}
        onChange={setFilters}
        items={itemsAll}
        onPlanesClick={() => setShowPlanes(true)}
      />

      {/* BOTÓN GUARDAR BÚSQUEDA COMO ALERTA */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveAlert}
          disabled={savingAlert}
        >
          {savingAlert ? "Guardando..." : "Guardar búsqueda como alerta"}
        </Button>
        {alertMsg && (
          <Typography sx={{ color: alertMsg.startsWith('¡') ? 'success.main' : 'error.main', fontWeight: 500 }}>
            {alertMsg}
          </Typography>
        )}
      </Box>

      {/* CONTADOR DE RESULTADOS */}
      {!loading && !error && (
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            mb: 2,
            px: 1,
          }}
        >
          <Typography 
            sx={{ 
              fontSize: 14, 
              fontWeight: 600,
              opacity: 0.85,
            }}
          >
            {list.length === 0 ? (
              "No hay resultados con los filtros aplicados"
            ) : list.length === 1 ? (
              "1 propiedad encontrada"
            ) : (
              `${list.length} propiedades encontradas`
            )}
          </Typography>
          <Typography 
            sx={{ 
              fontSize: 12, 
              opacity: 0.6,
            }}
          >
            de {itemsAll.length} totales
          </Typography>
        </Box>
      )}

      {/* RESULTADOS */}
      {loading ? (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ my: 3 }}>
          {error}
        </Typography>
      ) : list.length === 0 ? (
        <Box sx={{ textAlign: "center", my: 6, opacity: 0.7 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            🔍 No encontramos propiedades
          </Typography>
          <Typography variant="body2">
            Intentá ajustar los filtros para ver más resultados
          </Typography>
        </Box>
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
