"use client";

import { Box, Typography, Button, Card, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from "react";

type Props = {
  onClose: () => void;
};

export default function PlanesSection({ onClose }: Props) {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  const plans = [
    {
      id: "free",
      name: "FREE",
      price: 0,
      icon: "🧱",
      color: "#4CAF50",
      colorSecondary: "#A9E5B0",
      shortDesc: "Ideal para inmobiliarias que recién comienzan.",
      shortDesc2: "Publicá tus propiedades sin costo y empezá a ganar visibilidad.",
      longDesc: "El punto de partida perfecto para comenzar a mostrar tus inmuebles sin inversión inicial. Accedé a un paquete estable de publicaciones y empezá a posicionar tu marca inmobiliaria dentro de ITELSA Go. Ideal para agencias pequeñas o para quienes recién ingresan al sector digital.",
      tagline: "Ideal para empezar",
      features: [
        { text: "5 publicaciones", included: true },
        { text: "5 fotos por inmueble", included: true },
        { text: "Panel básico", included: true },
        { text: "Destacados", included: false },
        { text: "Estadísticas", included: false },
        { text: "Prioridad", included: false },
      ],
    },
    {
      id: "pro",
      name: "PRO",
      price: 100,
      icon: "🏠",
      color: "#2A6EBB",
      colorSecondary: "#70A6FF",
      shortDesc: "La opción perfecta para inmobiliarias activas.",
      shortDesc2: "Más publicaciones, más control y mayor exposición.",
      longDesc: "El plan más elegido. Accedé a una cantidad superior de publicaciones, herramientas de gestión mejoradas y un posicionamiento destacado que aumenta la exposición de tus inmuebles. Un equilibrio perfecto entre inversión y resultados.",
      tagline: "La mejor relación precio/calidad",
      popular: true,
      features: [
        { text: "25 publicaciones", included: true },
        { text: "20 fotos por inmueble", included: true },
        { text: "2 destacados por semana", included: true },
        { text: "Estadísticas de visitas", included: true },
        { text: "Soporte prioritario", included: true },
      ],
    },
    {
      id: "premium",
      name: "PREMIUM",
      price: 500,
      icon: "🏢",
      color: "#D9A441",
      colorSecondary: "#F2DFA5",
      shortDesc: "Para inmobiliarias que necesitan dominar el mercado.",
      shortDesc2: "Máxima visibilidad, prioridad y herramientas avanzadas.",
      longDesc: "El nivel más alto de ITELSA Go. Tu inmobiliaria obtiene prioridad en listados, máxima visibilidad, herramientas avanzadas de performance y soporte preferencial. Diseñado para grandes inmobiliarias o agencias que necesitan dominar su zona.",
      tagline: "Dominio total del mercado",
      features: [
        { text: "50 publicaciones", included: true },
        { text: "Fotos ilimitadas", included: true },
        { text: "6 destacados por semana", included: true },
        { text: "Estadísticas avanzadas", included: true },
        { text: "Soporte preferencial 24/7", included: true },
        { text: "Máximo posicionamiento", included: true },
      ],
    },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        overflowY: "auto",
        py: 4,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          maxWidth: 1200,
          margin: "0 auto",
          px: 2,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h3" fontWeight={900} sx={{ color: "white" }}>
            Planes de Suscripción
          </Typography>
          <Button
            onClick={onClose}
            sx={{
              minWidth: 40,
              height: 40,
              borderRadius: "50%",
              color: "white",
              "&:hover": { background: "rgba(255,255,255,0.1)" },
            }}
          >
            <CloseIcon />
          </Button>
        </Box>

        {/* TARJETAS DE PLANES */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
            mb: 4,
          }}
        >
          {plans.map((plan) => (
            <Card
              key={plan.id}
              sx={{
                position: "relative",
                p: 3,
                pt: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${plan.color}15, ${plan.colorSecondary}10)`,
                border: `2px solid ${plan.color}`,
                transition: "transform .2s ease",
                display: "flex",
                flexDirection: "column",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              {plan.popular && (
                <Chip
                  label="MÁS ELEGIDO"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 16,
                    background: plan.color,
                    color: "white",
                    fontWeight: 800,
                    fontSize: 10,
                  }}
                />
              )}

              {/* ICON + NAME */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Typography sx={{ fontSize: 40 }}>{plan.icon}</Typography>
                <Typography variant="h5" fontWeight={900} sx={{ color: plan.color }}>
                  {plan.name}
                </Typography>
              </Box>

              {/* PRECIO */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" fontWeight={900} sx={{ color: plan.color }}>
                  ${plan.price}
                  <Typography component="span" sx={{ fontSize: 16, fontWeight: 400, opacity: 0.7, ml: 0.5 }}>
                    USD/mes
                  </Typography>
                </Typography>
              </Box>

              {/* SHORT DESC */}
              <Typography sx={{ fontSize: 14, opacity: 0.9, mb: 0.5 }}>
                {plan.shortDesc}
              </Typography>
              <Typography sx={{ fontSize: 13, opacity: 0.75, mb: 2 }}>
                {plan.shortDesc2}
              </Typography>

              {/* FEATURES */}
              <Box sx={{ mb: 2, flex: 1 }}>
                {plan.features.map((feat, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
                    <Typography sx={{ fontSize: 16, color: feat.included ? plan.color : "#666" }}>
                      {feat.included ? "✔" : "✖"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        opacity: feat.included ? 0.95 : 0.5,
                        textDecoration: feat.included ? "none" : "line-through",
                      }}
                    >
                      {feat.text}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* TAGLINE */}
              <Typography
                sx={{
                  fontSize: 12,
                  fontStyle: "italic",
                  opacity: 0.8,
                  mb: 2,
                  color: plan.colorSecondary,
                }}
              >
                → {plan.tagline}
              </Typography>

              {/* BUTTON */}
              <Button
                fullWidth
                variant="contained"
                sx={{
                  background: plan.color,
                  color: "white",
                  fontWeight: 800,
                  "&:hover": { background: plan.colorSecondary, color: "#000" },
                }}
              >
                Elegir {plan.name}
              </Button>
            </Card>
          ))}
        </Box>

        {/* TABLA COMPARATIVA */}
        <Box
          sx={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.1)",
            p: 3,
          }}
        >
          <Typography variant="h5" fontWeight={900} sx={{ mb: 2, color: "white" }}>
            Tabla Comparativa Completa
          </Typography>

          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                  <th style={{ textAlign: "left", padding: "12px 8px", color: "rgba(255,255,255,0.9)" }}>
                    Beneficios
                  </th>
                  <th style={{ textAlign: "center", padding: "12px 8px", color: "#4CAF50" }}>
                    FREE 🧱
                  </th>
                  <th style={{ textAlign: "center", padding: "12px 8px", color: "#2A6EBB" }}>
                    PRO 🏠
                  </th>
                  <th style={{ textAlign: "center", padding: "12px 8px", color: "#D9A441" }}>
                    PREMIUM 🏢
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Publicaciones incluidas", "10", "50", "Ilimitadas"],
                  ["Fotos por inmueble", "5", "20", "Ilimitadas"],
                  ["Destacados semanales", "❌", "2", "6"],
                  ["Estadísticas de visitas", "❌", "✔️", "✔️ Avanzadas"],
                  ["Soporte técnico ITELSA Go", "Básico", "Prioritario", "Preferencial 24/7"],
                  ["Posicionamiento en resultados", "Estándar", "+30%", "Máxima prioridad"],
                  ["Logo de la inmobiliaria", "❌", "✔️", "✔️ Grande y destacado"],
                  ["Panel de rendimiento", "Básico", "Completo", "Pro + análisis profundo"],
                  ["Integración con redes sociales", "❌", "✔️", "✔️ Automática"],
                ].map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <td style={{ padding: "12px 8px", fontSize: 14, opacity: 0.9 }}>{row[0]}</td>
                    <td style={{ padding: "12px 8px", fontSize: 13, textAlign: "center", opacity: 0.85 }}>
                      {row[1]}
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: 13, textAlign: "center", opacity: 0.85 }}>
                      {row[2]}
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: 13, textAlign: "center", opacity: 0.85 }}>
                      {row[3]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>

        {/* DESCRIPCIONES LARGAS */}
        <Box sx={{ mt: 4, display: "grid", gap: 3 }}>
          {plans.map((plan) => (
            <Box
              key={plan.id}
              sx={{
                p: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${plan.color}10, transparent)`,
                border: `1px solid ${plan.color}40`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Typography sx={{ fontSize: 32 }}>{plan.icon}</Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: plan.color }}>
                  PLAN {plan.name}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>
                {plan.longDesc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
