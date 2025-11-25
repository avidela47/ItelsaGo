"use client";

import { Box, Fab, Tooltip } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

export default function WhatsAppButton() {
  const whatsappNumber = "5493517048836"; // Número de ITELSA
  const defaultMessage = "Hola! Tengo una consulta sobre ITELSA Go";
  
  const handleClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <Tooltip title="¿Necesitás ayuda? Chateá con nosotros" placement="left">
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          animation: "pulse 2s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.05)" },
          },
        }}
      >
        <Fab
          color="success"
          size="large"
          onClick={handleClick}
          sx={{
            width: 64,
            height: 64,
            background: "linear-gradient(135deg, #25D366, #128C7E)",
            boxShadow: "0 4px 20px rgba(37, 211, 102, 0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #128C7E, #075E54)",
              boxShadow: "0 6px 24px rgba(37, 211, 102, 0.6)",
            },
          }}
        >
          <WhatsAppIcon sx={{ fontSize: 36, color: "#fff" }} />
        </Fab>
      </Box>
    </Tooltip>
  );
}
