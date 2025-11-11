"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

export default function LoginPage() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/panel";
  const [code, setCode] = useState("");

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    // DEV: aceptamos un “código” simple. Cambialo cuando tengamos auth real.
    if (code.trim() !== "") {
      // Set cookie role=admin (expira en 12h)
      document.cookie = `role=admin; Path=/; Max-Age=${60 * 60 * 12}; SameSite=Lax`;
      window.location.href = next;
    }
  }

  return (
    <main style={{ padding: 24, display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <Paper sx={{ p: 3, width: 360 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          Ingreso administrador
        </Typography>
        <form onSubmit={doLogin} style={{ display: "grid", gap: 12 }}>
          <TextField
            label="Código de acceso (DEV)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained">Entrar</Button>
          <Typography variant="body2" sx={{ opacity: .7 }}>
            Solo para desarrollo. Después lo reemplazamos por auth real (correo/clave o SSO).
          </Typography>
        </form>
      </Paper>
    </main>
  );
}
