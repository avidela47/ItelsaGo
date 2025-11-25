"use client";

import { Box, Card, CardContent, Typography, Button, Divider, Avatar } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";

type AgencyContactProps = {
  agency?: {
    name?: string;
    logo?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  propertyTitle: string;
  onConsultaClick: () => void;
};

export default function AgencyContact({ agency, propertyTitle, onConsultaClick }: AgencyContactProps) {
  // Si no hay agencia, no mostramos nada
  if (!agency) return null;

  const handleWhatsApp = () => {
    const number = agency.whatsapp?.replace(/[^\d+]/g, "") || "";
    if (!number) return;
    const message = `Hola! Me interesa la propiedad: ${propertyTitle}`;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handlePhone = () => {
    const number = agency.phone?.replace(/[^\d+]/g, "") || "";
    if (number) window.location.href = `tel:${number}`;
  };

  const handleEmail = () => {
    if (agency.email) {
      const subject = `Consulta sobre: ${propertyTitle}`;
      window.location.href = `mailto:${agency.email}?subject=${encodeURIComponent(subject)}`;
    }
  };

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 4,
        p: 2,
      }}
    >
      <CardContent>
        {/* Header con logo y nombre */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          {agency.logo ? (
            <Avatar
              src={agency.logo}
              alt={agency.name}
              sx={{ width: 64, height: 64, border: "2px solid rgba(255,255,255,0.2)" }}
            />
          ) : (
            <Avatar sx={{ width: 64, height: 64, bgcolor: "#2A6EBB" }}>
              {agency.name?.charAt(0) || "A"}
            </Avatar>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#ffffff" }}>
              {agency.name || "Inmobiliaria"}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Publicado por esta agencia
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />

        <Typography
          variant="subtitle2"
          sx={{ mb: 2, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}
        >
          ¿Te interesa esta propiedad?
        </Typography>

        {/* Botones de acción */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* WhatsApp - Principal */}
          {agency.whatsapp && (
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<WhatsAppIcon />}
              onClick={handleWhatsApp}
              sx={{
                background: "linear-gradient(135deg, #25D366, #128C7E)",
                color: "#ffffff",
                fontWeight: 700,
                py: 1.5,
                boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #128C7E, #075E54)",
                  boxShadow: "0 6px 16px rgba(37, 211, 102, 0.4)",
                },
              }}
            >
              Consultar por WhatsApp
            </Button>
          )}

          {/* Formulario de consulta */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<SendIcon />}
            onClick={onConsultaClick}
            sx={{
              background: "linear-gradient(135deg, #2A6EBB, #1F5AAA)",
              color: "#ffffff",
              fontWeight: 700,
              py: 1.5,
              boxShadow: "0 4px 12px rgba(42, 110, 187, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #1F5AAA, #184A99)",
                boxShadow: "0 6px 16px rgba(42, 110, 187, 0.4)",
              },
            }}
          >
            Enviar Consulta
          </Button>

          {/* Botones secundarios */}
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            {agency.phone && (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PhoneIcon />}
                onClick={handlePhone}
                sx={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: "#ffffff",
                  "&:hover": {
                    borderColor: "#00d0ff",
                    background: "rgba(0,208,255,0.1)",
                  },
                }}
              >
                Llamar
              </Button>
            )}
            {agency.email && (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<EmailIcon />}
                onClick={handleEmail}
                sx={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: "#ffffff",
                  "&:hover": {
                    borderColor: "#00d0ff",
                    background: "rgba(0,208,255,0.1)",
                  },
                }}
              >
                Email
              </Button>
            )}
          </Box>
        </Box>

        {/* Info adicional */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 2,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
          }}
        >
          Respuesta típica en menos de 24 horas
        </Typography>
      </CardContent>
    </Card>
  );
}
