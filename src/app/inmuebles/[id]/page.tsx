"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import PropertyCard from "@/components/cards/PropertyCard";

type Plan = "premium" | "sponsor" | "free";

type Item = {
  _id: string;
  title: string;
  price: number;
  currency: "ARS" | "USD";
  location: string;
  images: string[];
  rooms?: number;
  propertyType?: "depto" | "casa" | "lote" | "local";
  operationType?: "venta" | "alquiler" | "temporario";
  description?: string;
  m2Total?: number;
  m2Cubiertos?: number;
  bathrooms?: number;
  bedrooms?: number;
  garage?: boolean;
  createdAt?: string;
  agency?: { name?: string; logo?: string; plan?: Plan; phone?: string; whatsapp?: string };
  lat?: number;
  lng?: number;
};

type ApiOne = { ok?: boolean; item?: Item; error?: string };
type ApiList = { ok?: boolean; items?: Item[]; error?: string };

export default function InmueblePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Item | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [similar, setSimilar] = useState<Item[]>([]);
  const [simErr, setSimErr] = useState<string | null>(null);

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/listings/${id}`, { cache: "no-store" });
        const data: ApiOne = await res.json();
        if (!res.ok || !data?.item) throw new Error(data?.error || "No encontrado");
        if (!ok) return;
        setItem(data.item);
        setIdx(0);
      } catch (e: any) {
        setErr(e?.message || "Error de red");
      } finally {
        setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [id]);

  useEffect(() => {
    if (!item?.location) return;
    let ok = true;
    (async () => {
      try {
        setSimErr(null);
        const res = await fetch(`/api/listings?location=${encodeURIComponent(item.location)}`, { cache: "no-store" });
        const data: ApiList = await res.json();
        if (!res.ok) throw new Error(data?.error || "No se pudo cargar similares");
        if (!ok) return;
        setSimilar((data.items || []).filter(x => x._id !== item._id).slice(0, 4));
      } catch (e: any) {
        setSimErr(e?.message || "Error cargando similares");
      }
    })();
    return () => { ok = false; };
  }, [item?._id, item?.location]);

  const imgs = useMemo(() => {
    const arr = Array.isArray(item?.images) ? item!.images.filter(Boolean) : [];
    return arr.length ? arr : ["/placeholder.jpg"];
  }, [item?.images]);

  const priceLabel = useMemo(() => {
    if (!item) return "";
    const p = new Intl.NumberFormat("es-AR").format(item.price || 0);
    return `${item.currency === "USD" ? "USD" : "ARS"} ${p}`;
  }, [item]);

  const isNuevo = useMemo(() => {
    if (!item?.createdAt) return false;
    const d = Date.parse(item.createdAt);
    return Date.now() - d < 1000 * 60 * 60 * 24 * 30; // 30 días
  }, [item?.createdAt]);

  function waLink() {
    const number = item?.agency?.whatsapp || item?.agency?.phone || "";
    const base = number ? `https://wa.me/${number}` : `https://wa.me/`;
    const text = encodeURIComponent(
      `Hola, me interesa el inmueble:\n${item?.title} – ${priceLabel}\n${item?.location}\n${typeof window !== "undefined" ? window.location.href : ""}`
    );
    return `${base}?text=${text}`;
  }
  function telLink() {
    const number = item?.agency?.phone?.replace(/\s|-/g, "") || "";
    return number ? `tel:${number}` : undefined;
  }

  if (loading) {
    return (
      <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography sx={{ opacity: 0.8 }}>Cargando…</Typography>
        </Box>
      </main>
    );
  }
  if (err || !item) {
    return (
      <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
        <Alert severity="error" sx={{ mb: 2 }}>{err || "No encontrado"}</Alert>
        <Button onClick={() => router.push("/inmuebles")}>Volver a inmuebles</Button>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Button size="small" onClick={() => router.back()} sx={{ textTransform: "none" }}>← Volver</Button>
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<FavoriteBorderIcon />}>Guardar</Button>
        </Box>
      </Box>

      {/* Layout 2 columnas */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.4fr 0.8fr" },
        gap: 3,
        alignItems: "start",
      }}>
        {/* Galería */}
        <Box>
          {/* Contenedor con RATIO para NO explotar la foto */}
          <Box sx={{
            position: "relative",
            width: "100%",
            maxWidth: "100%",
            aspectRatio: "16/10",
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,.10)",
            background: "rgba(255,255,255,.03)",
          }}>
            <img
              src={imgs[idx]}
              alt={item.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* BADGES sobre la foto: NUEVO + PLAN + LOGO */}
            <Box sx={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 1 }}>
              {isNuevo && <Chip label="NUEVO" size="small" color="success" sx={{ fontWeight: 700 }} />}
              {item.agency?.plan && (
                <Chip
                  label={(item.agency.plan as string).toUpperCase()}
                  size="small"
                  color={item.agency.plan === "premium" ? "warning" : item.agency.plan === "sponsor" ? "info" : "default"}
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>
            {item.agency?.logo && (
              <Box sx={{
                position: "absolute", bottom: 8, left: 8,
                p: 0.5, borderRadius: 1, background: "rgba(255,255,255,.95)",
                border: "1px solid rgba(0,0,0,.15)"
              }}>
                <img src={item.agency.logo} alt="logo-inmo" style={{ width: 34, height: 34, objectFit: "contain" }} />
              </Box>
            )}
          </Box>

          {/* Miniaturas */}
          {imgs.length > 1 && (
            <Box sx={{
              mt: 1.5,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
              gap: 1,
            }}>
              {imgs.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  style={{
                    position: "relative",
                    paddingTop: "62%",
                    borderRadius: 10,
                    overflow: "hidden",
                    border: i === idx ? "2px solid #00D084" : "1px solid rgba(255,255,255,.12)",
                    background: "rgba(255,255,255,.03)",
                    cursor: "pointer",
                  }}
                  aria-label={`miniatura-${i + 1}`}
                >
                  <img
                    src={src}
                    alt={`thumb-${i}`}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
              ))}
            </Box>
          )}

          {/* Descripción */}
          {item.description && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                {item.title}
              </Typography>
              <Typography sx={{ opacity: 0.85, whiteSpace: "pre-line" }}>
                {item.description}
              </Typography>
            </Box>
          )}

          {/* Mapa opcional */}
          {typeof item.lat === "number" && typeof item.lng === "number" && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Ubicación</Typography>
              <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid rgba(255,255,255,.1)" }}>
                <iframe
                  title="map"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${item.lat},${item.lng}&hl=es&z=15&output=embed`}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Sidebar */}
        <Box sx={{ position: { md: "sticky" }, top: { md: 16 }, display: "grid", gap: 2 }}>
          <Box sx={{
            p: 2, borderRadius: 2,
            border: "1px solid rgba(255,255,255,.12)",
            background: "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02))",
          }}>
            <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1 }}>
              {priceLabel}
            </Typography>
            <Typography sx={{ opacity: 0.75 }}>{item.title}</Typography>
            <Typography sx={{ opacity: 0.65, mt: 0.5 }}>{item.location}</Typography>

            <Divider sx={{ my: 2, opacity: 0.12 }} />

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              {item.propertyType && <Chip label={labelTipo(item.propertyType)} size="small" />}
              {item.operationType && <Chip label={labelOp(item.operationType)} size="small" />}
              {typeof item.rooms === "number" && <Chip label={`${item.rooms} amb.`} size="small" />}
              {typeof item.bedrooms === "number" && <Chip label={`${item.bedrooms} dorm.`} size="small" />}
              {typeof item.bathrooms === "number" && <Chip label={`${item.bathrooms} baños`} size="small" />}
              {typeof item.m2Total === "number" && <Chip label={`${item.m2Total} m² tot.`} size="small" />}
              {typeof item.m2Cubiertos === "number" && <Chip label={`${item.m2Cubiertos} m² cub.`} size="small" />}
              {item.garage && <Chip label="Cochera" size="small" />}
            </Box>

            <Box sx={{ display: "flex", gap: 1.2, mt: 2 }}>
              <Button fullWidth variant="contained" startIcon={<WhatsAppIcon />} href={waLink()} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </Button>
              <Button fullWidth variant="outlined" startIcon={<PhoneIcon />} href={telLink()} disabled={!telLink()}>
                Llamar
              </Button>
            </Box>
          </Box>

          <Box sx={{
            p: 2, borderRadius: 2,
            border: "1px solid rgba(255,255,255,.12)",
            background: "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02))",
            display: "flex", alignItems: "center", gap: 1.2,
          }}>
            {item.agency?.logo && (
              <img
                src={item.agency.logo}
                alt="logo-agencia"
                style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8, padding: 2, background: "rgba(255,255,255,.95)", border: "1px solid rgba(0,0,0,.15)" }}
              />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700}>{item.agency?.name || "Inmobiliaria"}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: .8, mt: .2 }}>
                {item.agency?.plan && (
                  <Chip
                    label={item.agency.plan.toUpperCase()}
                    size="small"
                    color={item.agency.plan === "premium" ? "warning" : item.agency.plan === "sponsor" ? "info" : "default"}
                  />
                )}
                {item.agency?.phone && <Typography sx={{ opacity: .75, fontSize: 13 }}>{item.agency.phone}</Typography>}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Similares */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
          Propiedades similares en {item.location}
        </Typography>
        {simErr ? (
          <Typography sx={{ opacity: .7 }}>{simErr}</Typography>
        ) : similar.length === 0 ? (
          <Typography sx={{ opacity: .7 }}>No encontramos similares.</Typography>
        ) : (
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" },
            gap: 3,
          }}>
            {similar.map(s => <PropertyCard key={s._id} item={s} />)}
          </Box>
        )}
      </Box>
    </main>
  );
}

function labelTipo(t?: Item["propertyType"]) {
  if (t === "depto") return "Departamento";
  if (t === "casa") return "Casa";
  if (t === "lote") return "Lote";
  if (t === "local") return "Local";
  return "Propiedad";
}
function labelOp(o?: Item["operationType"]) {
  if (o === "venta") return "Venta";
  if (o === "alquiler") return "Alquiler";
  if (o === "temporario") return "Temporario";
  return "Operación";
}










