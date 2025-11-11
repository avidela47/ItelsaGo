"use client";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function PanelHome() {
  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h5" fontWeight={800}>Resumen</Typography>
      <Typography sx={{ opacity: .8 }}>
        Bienvenido al Panel PRO. Usá el menú de la izquierda para gestionar inmuebles.
      </Typography>
    </Box>
  );
}

