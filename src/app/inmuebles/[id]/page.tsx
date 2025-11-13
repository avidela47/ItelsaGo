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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PropertyCard from "@/components/cards/PropertyCard";

type Plan = "premium" | "pro" | "sponsor" | "free";

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
  const [role, setRole] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [similar, setSimilar] = useState<Item[]>([]);
  const [simErr, setSimErr] = useState<string | null>(null);

  // Leer rol del localStorage
  useEffect(() => {
    const r = window.localStorage.getItem("role");
    setRole(r);
  }, []);

  // Fetch del item
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

  // Similares por tipo de propiedad
  useEffect(() => {
    if (!item?.propertyType) return;
    const type = item.propertyType;
    let ok = true;
    (async () => {
      try {
        setSimErr(null);
        const res = await fetch(`/api/listings?type=${encodeURIComponent(type)}`, { cache: "no-store" });
        const data: ApiList = await res.json();
        if (!res.ok) throw new Error(data?.error || "No se pudo cargar similares");
        if (!ok) return;
        setSimilar((data.items || []).filter(x => x._id !== item._id).slice(0, 4));
      } catch (e: any) {
        setSimErr(e?.message || "Error cargando similares");
      }
    })();
    return () => { ok = false; };
  }, [item?._id, item?.propertyType]);

  // Imágenes seguras
  const imgs = useMemo(() => {
    const arr = Array.isArray(item?.images) ? item!.images.filter(Boolean) : [];
    return arr.length ? arr : ["/placeholder.jpg"];
  }, [item?.images]);

  // Precio formateado
  const priceLabel = useMemo(() => {
    if (!item) return "";
    const p = new Intl.NumberFormat("es-AR").format(item.price || 0);
    return `${item.currency === "USD" ? "USD" : "ARS"} ${p}`;
  }, [item]);

  // Links contacto
  function waLink() {
    const raw = item?.agency?.whatsapp || item?.agency?.phone || "";
    // saneo: dejo + y dígitos
    const number = raw.replace(/[^\d+]/g, "");
    const base = number ? `https://wa.me/${number}` : `https://wa.me/`;
    const text = encodeURIComponent(
      `Hola, me interesa el inmueble:\n${item?.title} – ${priceLabel}\n${item?.location}\n${typeof window !== "undefined" ? window.location.href : ""}`
    );
    return `${base}?text=${text}`;
  }
  function telLink() {
    const number = (item?.agency?.phone || "").replace(/[^\d+]/g, "");
    return number ? `tel:${number}` : undefined;
  }

  // Función eliminar (solo admin)
  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este inmueble?")) return;
    try {
      const res = await fetch(`/api/listings/${item?._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      alert("Inmueble eliminado exitosamente");
      router.push("/inmuebles");
    } catch (error) {
      alert("Error al eliminar el inmueble");
    }
  }

  // Función editar (solo admin)
  function handleEdit() {
    router.push(`/inmuebles/${item?._id}/editar`);
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

  // Seguridad por si idx queda fuera de rango
  const safeIdx = Math.min(Math.max(idx, 0), imgs.length - 1);

  return (
    <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Toolbar superior */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Button size="small" onClick={() => router.back()} sx={{ textTransform: "none" }}>← Volver</Button>
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<FavoriteBorderIcon />}>
            Guardar
          </Button>
        </Box>
      </Box>

      {/* Layout 2 columnas */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.4fr 0.8fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* Galería */}
        <Box>
          {/* Contenedor con ratio fijo (foto NO gigante) */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: "100%",
              aspectRatio: "16/10",
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,.10)",
              background: "rgba(255,255,255,.03)",
            }}
          >
            <img
              src={imgs[safeIdx]}
              alt={item.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* BADGES: arriba a la derecha (chicos) */}
            {item.agency?.plan && (
              <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                <Chip
                  label={(item.agency.plan === "sponsor" ? "PRO" : item.agency.plan).toUpperCase()}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    opacity: 0.95,
                    ...(item.agency.plan === "premium" && {
                      bgcolor: "#D9A441",
                      color: "#ffffff",
                    }),
                    ...((item.agency.plan === "pro" || item.agency.plan === "sponsor") && {
                      bgcolor: "#2A6EBB",
                      color: "#ffffff",
                    }),
                    ...(item.agency.plan === "free" && {
                      bgcolor: "#4CAF50",
                      color: "#ffffff",
                    }),
                  }}
                  title={`Plan: ${item.agency.plan === "sponsor" ? "pro" : item.agency.plan}`}
                />
              </Box>
            )}

            {/* Logo inmobiliaria abajo a la izquierda */}
            {item.agency?.logo && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  p: 0.5,
                  borderRadius: 1,
                  background: "rgba(255,255,255,.96)",
                  border: "1px solid rgba(0,0,0,.15)",
                }}
              >
                <img
                  src={item.agency.logo}
                  alt="logo-inmo"
                  style={{ width: 36, height: 36, objectFit: "contain" }}
                />
              </Box>
            )}
          </Box>

          {/* Miniaturas */}
          {imgs.length > 1 && (
            <Box
              sx={{
                mt: 1.5,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
                gap: 1,
              }}
            >
              {imgs.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  style={{
                    position: "relative",
                    paddingTop: "62%",
                    borderRadius: 10,
                    overflow: "hidden",
                    border: i === safeIdx ? "2px solid #00D084" : "1px solid rgba(255,255,255,.12)",
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

          {/* Mapa (opcional) */}
          {typeof item.lat === "number" && typeof item.lng === "number" && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Ubicación
              </Typography>
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
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,.12)",
              background: "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02))",
            }}
          >
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
              <Button
                fullWidth
                variant="contained"
                startIcon={<WhatsAppIcon />}
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </Button>
              <Button fullWidth variant="outlined" startIcon={<PhoneIcon />} href={telLink()} disabled={!telLink()}>
                Llamar
              </Button>
            </Box>

            {/* Botones de admin */}
            {role === "admin" && (
              <Box sx={{ display: "flex", gap: 1.2, mt: 1.5 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Editar
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                >
                  Eliminar
                </Button>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,.12)",
              background: "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02))",
              display: "flex",
              alignItems: "center",
              gap: 1.2,
            }}
          >
            {item.agency?.logo && (
              <img
                src={item.agency.logo}
                alt="logo-agencia"
                style={{
                  width: 44,
                  height: 44,
                  objectFit: "contain",
                  borderRadius: 8,
                  padding: 2,
                  background: "rgba(255,255,255,.95)",
                  border: "1px solid rgba(0,0,0,.15)",
                }}
              />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700}>{item.agency?.name || "Inmobiliaria"}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.2 }}>
                {item.agency?.plan && (
                  <Chip
                    label={(item.agency.plan === "sponsor" ? "PRO" : item.agency.plan).toUpperCase()}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      ...(item.agency.plan === "premium" && {
                        bgcolor: "#D9A441",
                        color: "#ffffff",
                      }),
                      ...((item.agency.plan === "pro" || item.agency.plan === "sponsor") && {
                        bgcolor: "#2A6EBB",
                        color: "#ffffff",
                      }),
                      ...(item.agency.plan === "free" && {
                        bgcolor: "#4CAF50",
                        color: "#ffffff",
                      }),
                    }}
                  />
                )}
                {item.agency?.phone && (
                  <Typography sx={{ opacity: 0.75, fontSize: 13 }}>{item.agency.phone}</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Similares */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
          Propiedades similares: {item.propertyType ? labelTipo(item.propertyType) : "Todas"}
        </Typography>
        {simErr ? (
          <Typography sx={{ opacity: 0.7 }}>{simErr}</Typography>
        ) : similar.length === 0 ? (
          <Typography sx={{ opacity: 0.7 }}>No encontramos similares.</Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" },
              gap: 3,
            }}
          >
            {similar.map((s) => (
              <PropertyCard key={s._id} item={s} />
            ))}
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







