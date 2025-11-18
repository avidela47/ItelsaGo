"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import PropertyCard from "@/components/cards/PropertyCard";
import AgencyContact from "@/components/AgencyContact";
import ImageLightbox from "@/components/ImageLightbox";

// Importar MapView dinámicamente para evitar SSR
const MapView = dynamic(() => import("@/components/maps/MapView"), {
  ssr: false,
  loading: () => <Box sx={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}><CircularProgress /></Box>
});

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
  _reasons?: string[]; // Razones de recomendación
  _score?: number; // Score de recomendación
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

  // Estado del lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Estado del formulario de contacto
  const [openContact, setOpenContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sendingContact, setSendingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

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

        // Incrementar contador de vistas
        fetch(`/api/listings/${id}/view`, { method: "POST" }).catch(err => 
          console.error("Error incrementando vistas:", err)
        );
      } catch (e: any) {
        setErr(e?.message || "Error de red");
      } finally {
        setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [id]);

  // Recomendaciones inteligentes
  useEffect(() => {
    if (!item?._id) return;
    let ok = true;
    (async () => {
      try {
        setSimErr(null);
        const res = await fetch(`/api/recommendations/${item._id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "No se pudo cargar recomendaciones");
        if (!ok) return;
        setSimilar(data.recommendations || []);
      } catch (e: any) {
        setSimErr(e?.message || "Error cargando recomendaciones");
      }
    })();
    return () => { ok = false; };
  }, [item?._id]);

  // Meta tags dinámicos para SEO
  useEffect(() => {
    if (!item) return;
    
    const title = `${item.title} - ${item.location} | ITELSA Go`;
    const description = item.description 
      ? item.description.slice(0, 160) 
      : `${item.propertyType || "Propiedad"} en ${item.operationType || "venta"} en ${item.location}. ${item.price ? `Precio: ${item.currency} ${new Intl.NumberFormat("es-AR").format(item.price)}` : ""}`;
    const imageUrl = item.images?.[0] ? `${window.location.origin}${item.images[0]}` : `${window.location.origin}/logo-itelsa-go.svg`;
    const url = window.location.href;

    document.title = title;
    
    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Open Graph tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:image': imageUrl,
      'og:url': url,
      'og:type': 'website',
      'og:locale': 'es_AR',
      'og:site_name': 'ITELSA Go'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    });

    // Twitter tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': imageUrl,
      'twitter:site': '@ItelsaGo'
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    });

    // JSON-LD Structured Data (Schema.org)
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": item.title,
      "description": description,
      "url": url,
      "image": item.images?.map(img => `${window.location.origin}${img}`) || [imageUrl],
      "offers": {
        "@type": "Offer",
        "price": item.price,
        "priceCurrency": item.currency,
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": item.agency?.name || "ITELSA Go",
          ...(item.agency?.logo && { "logo": `${window.location.origin}${item.agency.logo}` })
        }
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": item.location,
        "addressCountry": "AR"
      },
      ...(item.m2Total && { "floorSize": { "@type": "QuantitativeValue", "value": item.m2Total, "unitCode": "MTK" } }),
      ...(item.bedrooms && { "numberOfBedrooms": item.bedrooms }),
      ...(item.bathrooms && { "numberOfBathroomsTotal": item.bathrooms }),
      ...(item.rooms && { "numberOfRooms": item.rooms })
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);
  }, [item]);

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

  // Función para enviar consulta
  async function handleSendContact() {
    const { name, email, message } = contactForm;
    if (!name || !email || !message) {
      setContactError("Por favor completá todos los campos obligatorios");
      return;
    }

    setSendingContact(true);
    setContactError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: item?._id,
          name,
          email,
          phone: contactForm.phone,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al enviar consulta");
      }

      setContactSuccess(true);
      setTimeout(() => {
        setOpenContact(false);
        setContactSuccess(false);
        setContactForm({ name: "", email: "", phone: "", message: "" });
      }, 2000);
    } catch (error: any) {
      setContactError(error.message || "Error al enviar la consulta");
    } finally {
      setSendingContact(false);
    }
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

  // JSON-LD structured data para SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": item.title,
    "description": item.description || `${item.propertyType || "Propiedad"} en ${item.operationType || "venta"}`,
    "url": typeof window !== "undefined" ? window.location.href : "",
    "image": imgs[0],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": item.location,
      "addressCountry": "AR"
    },
    "offers": {
      "@type": "Offer",
      "price": item.price,
      "priceCurrency": item.currency,
      "availability": "https://schema.org/InStock"
    },
    ...(item.m2Total && {
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": item.m2Total,
        "unitCode": "MTK"
      }
    }),
    ...(item.bedrooms && { "numberOfRooms": item.bedrooms }),
    ...(item.bathrooms && { "numberOfBathroomsTotal": item.bathrooms }),
    ...(item.agency?.name && {
      "provider": {
        "@type": "Organization",
        "name": item.agency.name
      }
    })
  };

  return (
    <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
      {/* JSON-LD para Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
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
              cursor: "pointer",
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.01)",
              },
            }}
            onClick={() => setLightboxOpen(true)}
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
                  onClick={() => {
                    setIdx(i);
                    setLightboxOpen(true);
                  }}
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

          {/* Mapa interactivo con Leaflet */}
          {typeof item.lat === "number" && typeof item.lng === "number" && (
            <Box sx={{ mt: 4 }}>
              <MapView
                lat={item.lat}
                lng={item.lng}
                address={item.location}
                height={400}
                title="Ubicación"
              />
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

            {/* Sección de contacto con la agencia */}
            <Box sx={{ mt: 3 }}>
              <AgencyContact
                agency={item.agency}
                propertyTitle={item.title}
                onConsultaClick={() => setOpenContact(true)}
              />
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
                {item.agency?.plan && (
                  <Typography sx={{ opacity: 0.75, fontSize: 13, fontWeight: 600 }}>
                    {item.agency.plan === "free" && "+5 ventas"}
                    {item.agency.plan === "pro" && "+25 ventas"}
                    {item.agency.plan === "premium" && "+100 ventas"}
                    {item.agency.plan === "sponsor" && "+25 ventas"}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Recomendaciones inteligentes */}
      <Box sx={{ mt: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={800}>
            Te puede interesar
          </Typography>
          <Chip 
            label="Recomendado para ti" 
            size="small"
            sx={{
              background: "linear-gradient(135deg, #00d0ff, #0099cc)",
              color: "#fff",
              fontWeight: 700,
            }}
          />
        </Box>
        
        {simErr ? (
          <Typography sx={{ opacity: 0.7 }}>{simErr}</Typography>
        ) : similar.length === 0 ? (
          <Typography sx={{ opacity: 0.7 }}>No hay recomendaciones disponibles en este momento.</Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {similar.map((s) => (
              <Box key={s._id} sx={{ position: "relative" }}>
                {/* Badge de razón principal */}
                {s._reasons && s._reasons.length > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      zIndex: 2,
                      bgcolor: "rgba(0, 208, 255, 0.95)",
                      color: "#fff",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    {s._reasons[0]}
                  </Box>
                )}
                <PropertyCard item={s} />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Dialog de formulario de contacto */}
      <Dialog open={openContact} onClose={() => setOpenContact(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Consultar por esta propiedad</DialogTitle>
        <DialogContent>
          {contactSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              ¡Consulta enviada exitosamente! La inmobiliaria te contactará pronto.
            </Alert>
          ) : (
            <>
              <Typography sx={{ mb: 2, opacity: 0.8 }}>
                Enviá tu consulta y la inmobiliaria te responderá a la brevedad.
              </Typography>

              {contactError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {contactError}
                </Alert>
              )}

              <TextField
                label="Nombre completo *"
                fullWidth
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Email *"
                type="email"
                fullWidth
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Teléfono (opcional)"
                fullWidth
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Mensaje *"
                multiline
                rows={4}
                fullWidth
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Ej: Me interesa esta propiedad. ¿Está disponible para visitar?"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContact(false)} disabled={sendingContact}>
            Cancelar
          </Button>
          {!contactSuccess && (
            <Button
              variant="contained"
              onClick={handleSendContact}
              disabled={sendingContact}
              startIcon={sendingContact ? <CircularProgress size={16} /> : <EmailIcon />}
            >
              {sendingContact ? "Enviando..." : "Enviar Consulta"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Lightbox de imágenes */}
      {lightboxOpen && (
        <ImageLightbox
          images={imgs}
          initialIndex={safeIdx}
          onClose={() => setLightboxOpen(false)}
        />
      )}
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







