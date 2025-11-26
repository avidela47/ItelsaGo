"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Typography, TextField, Button, Alert, CircularProgress } from "@mui/material";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!password || password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al restablecer contraseña");
      setSuccess("Contraseña restablecida correctamente. Ya puedes iniciar sesión.");
      setPassword("");
      setConfirm("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8} p={3} boxShadow={3} borderRadius={3} bgcolor="#fff">
      <Typography variant="h5" fontWeight={700} mb={2} color="primary">Restablecer contraseña</Typography>
      <Typography variant="body2" mb={2} color="text.secondary">
        Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nueva contraseña"
          type="password"
          fullWidth
          value={password}
          onChange={e => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Confirmar contraseña"
          type="password"
          fullWidth
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          sx={{ mb: 2 }}
        />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Button
          type="submit"
          disabled={loading}
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
          {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : "Restablecer contraseña"}
        </Button>
      </form>
    </Box>
  );
}
