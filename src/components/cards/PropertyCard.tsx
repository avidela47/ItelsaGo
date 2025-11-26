"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FavButton from "@/components/cards/FavButton";

type Plan = "premium" | "pro" | "sponsor" | "free";

export type Item = {
  _id: string;
  title: string;
  price: number;
  currency: "ARS" | "USD";
  location: string;
  images: string[];
  rooms?: number;
  propertyType?: "depto" | "casa" | "lote" | "local";
  agency?: { logo?: string; plan?: Plan; whatsapp?: string };
  createdAt?: string;
  m2Total?: number;
  m2Cubiertos?: number;
  bedrooms?: number;
  bathrooms?: number;
  garage?: boolean;
  operationType?: "venta" | "alquiler" | "temporario";
};

// Utilidad local para formatear dinero si no existe import
function money(price: number, currency: "ARS" | "USD") {
  const p = new Intl.NumberFormat("es-AR").format(price || 0);
  return `${currency === "USD" ? "USD" : "ARS"} ${p}`;
}

interface PropertyCardProps {
  item: Item;
}

export default function PropertyCard({ item }: PropertyCardProps) {
  const img = item.images?.[0] || "/placeholder.jpg";
  const url = `/inmuebles/${item._id}`;
  const plan = item.agency?.plan === "sponsor" ? "pro" : item.agency?.plan;
  const waHref = (() => {
    const number = item?.agency?.whatsapp?.replace(/[^\d+]/g, "") || "";
    const base = number ? `https://wa.me/${number}` : `https://wa.me/`;
    const text = encodeURIComponent(`Hola, me interesa: ${item.title} – ${money(item.price, item.currency)} – ${item.location}`);
    return `${base}?text=${text}`;
  })();

  return (
    <Box
      component="a"
      href={url}
      sx={{
        textDecoration: "none",
        "&:hover": { 
          textDecoration: "none", 
          transform: "translateY(-4px)", 
          boxShadow: "0 20px 40px rgba(0,208,255,.15), 0 0 0 1px rgba(0,208,255,.3)",
        },
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,.12)",
        background: "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.03))",
        boxShadow: "0 10px 24px rgba(0,0,0,.20)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all .25s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: "fadeIn 0.4s ease-out",
        "@keyframes fadeIn": {
          from: { 
            opacity: 0, 
            transform: "translateY(10px)" 
          },
          to: { 
            opacity: 1, 
            transform: "translateY(0)" 
          },
        },
      }}
      aria-label={item.title}
    >
      {/* FOTO */}
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/10", overflow: "hidden" }}>
        <img
          src={img}
          alt={`Foto principal de ${item.title} en ${item.location}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* BOTÓN FAVORITO → ARRIBA IZQUIERDA */}
        <Box sx={{ position: "absolute", top: 8, left: 8, zIndex: 10 }}>
          <FavButton id={item._id} />
        </Box>

        {/* BADGE PLAN → ARRIBA DERECHA */}
        {plan && (
          <Box sx={{ position: "absolute", top: 8, right: 8 }}>
            <Chip
              label={plan.toUpperCase()}
              size="small"
              sx={{
                fontWeight: 800,
                height: 20,
                fontSize: 11,
                px: 0.6,
                background: plan === "premium" ? "#D9A441" : plan === "pro" ? "#2A6EBB" : "#4CAF50",
                color: "#ffffff",
                border: "none",
              }}
            />
          </Box>
        )}

        {/* LOGO AGENCIA → ABAJO IZQUIERDA */}
        {item.agency?.logo && (
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              px: 0.6,
              py: 0.4,
              borderRadius: 1,
              background: "rgba(255,255,255,.95)",
              border: "1px solid rgba(0,0,0,.12)",
            }}
          >
            <img
              src={item.agency.logo}
              alt={`Logo de la inmobiliaria ${item.agency.logo}`}
              style={{ width: 30, height: 30, objectFit: "contain" }}
            />
          </Box>
        )}
      </Box>

      {/* BODY */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 1.8, gap: 0.6 }}>
        {/* PRECIO */}
        <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.1 }}>
          {money(item.price, item.currency)}
        </Typography>

        {/* TÍTULO → 2 líneas fijas */}
        <Typography
          sx={{
            opacity: 0.9,
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1.25,
            height: "2.5em",                 // 2 líneas
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
          }}
          title={item.title}
        >
          {item.title}
        </Typography>

        {/* UBICACIÓN → 1 línea */}
        <Typography
          sx={{
            opacity: 0.65,
            fontSize: 13,
            height: "1.3em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={item.location}
        >
          {item.location}
        </Typography>

        {/* ROOMS (opcional) */}
        {typeof item.rooms === "number" && (
          <Typography sx={{ opacity: 0.65, fontSize: 13 }}>{item.rooms} amb.</Typography>
        )}

        {/* FILL para empujar botón y fijar altura */}
        <Box sx={{ flex: 1 }} />

        {/* BOTÓN WHATSAPP fijo abajo */}
        <Button
          variant="contained"
          fullWidth
          size="small"
          startIcon={<WhatsAppIcon />}
          sx={{
            mt: 1.2,
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 2,
            background: "linear-gradient(90deg,#25d366 0%,#128c7e 100%)",
            color: "#fff",
            boxShadow: "0 2px 8px 0 rgba(37,211,102,.10)",
            textTransform: "none",
            transition: "background .18s, box-shadow .18s, transform .12s",
            '&:hover': {
              background: "linear-gradient(90deg,#128c7e 0%,#25d366 100%)",
              boxShadow: "0 4px 16px 0 rgba(37,211,102,.18)",
              transform: "translateY(-2px) scale(1.03)",
            },
            '&:focus-visible': {
              outline: '2.5px solid #25d366',
              outlineOffset: 2,
            },
          }}
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Contactar por WhatsApp sobre ${item.title} en ${item.location}`}
          tabIndex={0}
        >
          WhatsApp
        </Button>
      </Box>
    </Box>
  );
}













