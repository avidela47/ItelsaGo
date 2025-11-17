"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FavButton from "@/components/cards/FavButton";

type Plan = "premium" | "pro" | "sponsor" | "free";

type Item = {
  _id: string;
  title: string;
  price: number;
  currency: "ARS" | "USD";
  location: string;
  images: string[];
  rooms?: number;
  propertyType?: string;
  operationType?: string;
  m2Total?: number;
  m2Cubiertos?: number;
  bathrooms?: number;
  bedrooms?: number;
  garage?: boolean;
  agency?: { logo?: string; plan?: Plan; whatsapp?: string };
  createdAt?: string;
};

function money(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "ARS",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString("es-AR")}`;
  }
}

export default function PropertyCard({ item }: { item: Item }) {
  const img = item.images?.[0] || "/placeholder.jpg";
  const url = `/inmuebles/${item._id}`;

  // Normalizar sponsor -> pro para compatibilidad
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
        "&:hover": { textDecoration: "none", transform: "translateY(-3px)", boxShadow: "0 16px 30px rgba(0,0,0,.28)" },
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,.12)",
        background: "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.03))",
        boxShadow: "0 10px 24px rgba(0,0,0,.20)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform .18s ease, box-shadow .18s ease",
      }}
      aria-label={item.title}
    >
      {/* FOTO */}
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/10", overflow: "hidden" }}>
        <img
          src={img}
          alt={item.title}
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
              alt="logo-inmobiliaria"
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
            background: "linear-gradient(135deg,rgba(0,208,255,.25),rgba(0,255,225,.18))",
            border: "1px solid rgba(0,208,255,.45)",
            color: "#e9eef5",
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 800,
            transition: "background .15s ease, transform .15s ease",
            "&:hover": {
              background: "linear-gradient(135deg,rgba(0,208,255,.35),rgba(0,255,225,.28))",
              transform: "translateY(-1px)",
            },
          }}
          onClick={(e) => {
            e.preventDefault();
            window.open(waHref, "_blank");
          }}
        >
          WhatsApp
        </Button>
      </Box>
    </Box>
  );
}













