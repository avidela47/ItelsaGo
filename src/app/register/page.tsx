"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  MenuItem,
} from "@mui/material";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "err", text: data?.error || "No se pudo registrar" });
        setBusy(false);
        return;
      }
      setMsg({ type: "ok", text: "Usuario creado" });
      setTimeout(() => router.push("/login"), 600);
    } catch {
      setMsg({ type: "err", text: "Error de red" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
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
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2, textAlign: "center" }}>
          Crear usuario
        </Typography>

        {msg && (
          <Alert
            severity={msg.type === "ok" ? "success" : "error"}
            sx={{ mb: 2 }}
          >
            {msg.text}
          </Alert>
        )}

        <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
          <TextField
            label="Nombre"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <TextField
            select
            label="Rol"
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "user")}
          >
            <MenuItem value="user">Usuario</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>

          <Button type="submit" disabled={busy} variant="contained" fullWidth>
            {busy ? "Creando..." : "Crear usuario"}
          </Button>
        </form>
      </Paper>
    </main>
  );
}

