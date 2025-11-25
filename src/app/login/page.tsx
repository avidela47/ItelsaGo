"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  FormControlLabel,
  Switch,
  Link,
} from "@mui/material";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteMode, setInviteMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Remover scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);

    try {
      const url = inviteMode
        ? "/api/auth/login?guest=1"
        : "/api/auth/login";

      const res = await fetch(url, {
        method: "POST",
        headers: inviteMode ? undefined : { "Content-Type": "application/json" },
        body: inviteMode ? undefined : JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: "err", text: data?.error || "No se pudo iniciar sesión" });
        setBusy(false);
        return;
      }

      // Guardar el rol en localStorage
      if (data.role) {
        localStorage.setItem("role", data.role);
        // Disparar evento personalizado para que Navbar escuche el cambio en la misma pestaña
        window.dispatchEvent(new Event("role-changed"));
      }

      setMsg({ type: "ok", text: "Sesión iniciada" });

      setTimeout(() => {
        window.location.href = "/inmuebles"; // Recarga completa para actualizar el Navbar
      }, 400);
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
            alt="ITELSA Go"
            style={{ height: 48, marginBottom: 16 }}
          />
          <Typography variant="h5">
            Ingresar
          </Typography>
        </Box>

        {msg && (
          <Alert
            severity={msg.type === "ok" ? "success" : "error"}
            sx={{ mb: 2 }}
          >
            {msg.text}
          </Alert>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 16 }}
          noValidate
        >
          {!inviteMode && (
            <>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={inviteMode}
                onChange={(e) => setInviteMode(e.target.checked)}
              />
            }
            label="Entrar como invitado (solo ver inmuebles)"
          />

          <Button type="submit" disabled={busy} variant="contained" fullWidth>
            {busy ? "Ingresando..." : inviteMode ? "Entrar como invitado" : "Iniciar sesión"}
          </Button>
        </form>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              sx={{
                color: "#00d0ff",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Regístrate
            </Link>
          </Typography>
        </Box>
      </Paper>
    </main>
  );
}


