"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Link,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const router = useRouter();

  // Eliminar scroll vertical del body solo en esta página
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "";
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "err", text: data?.error || "No se pudo enviar el email" });
        setBusy(false);
        return;
      }
      setMsg({ type: "ok", text: "Si el email existe, se envió un enlace para restablecer la contraseña." });
    } catch {
      setMsg({ type: "err", text: "Error de red" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        overflow: "hidden",
        paddingBottom: "15vh",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 3,
          borderRadius: 3,
          background:
            "linear-gradient(180deg, rgba(15,17,23,.98), rgba(8,10,14,.98))",
          border: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <img
            src="/logo-itelsa-go.svg"
            alt="Logo ITELSA Go, plataforma inmobiliaria"
            style={{ height: 48, marginBottom: 16 }}
          />
          <Typography variant="h5">Recuperar contraseña</Typography>
        </Box>
        {msg && (
          <Alert severity={msg.type === "ok" ? "success" : "error"} sx={{ mb: 2 }}>
            {msg.text}
          </Alert>
        )}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }} noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
          <Button
            type="submit"
            disabled={busy || !email}
            variant="contained"
            fullWidth
            sx={{
              fontWeight: 700,
              fontSize: 17,
              py: 1.3,
              borderRadius: 2.5,
              boxShadow: '0 2px 12px 0 rgba(0,208,255,.10)',
              background: 'linear-gradient(90deg, #00d0ff 0%, #2a6ebb 100%)',
              transition: 'background .18s, box-shadow .18s, transform .12s',
              '&:hover': {
                background: 'linear-gradient(90deg, #2a6ebb 0%, #00d0ff 100%)',
                boxShadow: '0 4px 24px 0 rgba(0,208,255,.18)',
                transform: 'translateY(-2px) scale(1.03)',
              },
              '&:focus': {
                outline: '2px solid #00d0ff',
                outlineOffset: 2,
              },
            }}
          >
            {busy ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : "Enviar enlace"}
          </Button>
        </form>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            <Link
              href="/login"
              sx={{ color: "#00d0ff", textDecoration: "none", fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
            >
              Volver al login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </main>
  );
}
