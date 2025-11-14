"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

type Role = "guest" | "user" | "agency" | "admin";
type Plan = "free" | "pro" | "premium";
type PropertyType = "depto" | "casa" | "lote" | "local";

function getRoleFromCookie(): Role {
  if (typeof document === "undefined") return "guest";
  
  // Primero intentar leer de localStorage (usado en login)
  const localRole = window.localStorage.getItem("role");
  if (localRole === "admin" || localRole === "user" || localRole === "agency") {
    return localRole;
  }
  
  // Si no está en localStorage, intentar con cookies
  const match = document.cookie.match(/(?:^|;)\s*role=([^;]+)/);
  const value = match ? decodeURIComponent(match[1]) : "";
  if (value === "admin" || value === "user" || value === "agency") return value;
  
  return "guest";
}

export default function PublicarPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("guest");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string>(""); // Nombre de la inmobiliaria

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [currency, setCurrency] = useState<"USD" | "ARS">("USD");
  const [propertyType, setPropertyType] = useState<PropertyType>("casa");
  const [rooms, setRooms] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string>("");
  const [plan, setPlan] = useState<Plan>("free"); // por defecto free

  useEffect(() => {
    const r = getRoleFromCookie();
    setRole(r);
    setLoading(false);
    if (r !== "admin" && r !== "agency") {
      router.replace("/login?from=publicar");
    }
    
    // Si es agency, obtener el nombre de la inmobiliaria
    if (r === "agency") {
      const name = window.localStorage.getItem("name") || 
                   document.cookie.match(/(?:^|;)\s*name=([^;]+)/)?.[1] || "";
      setAgencyName(decodeURIComponent(name));
    }
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    try {
      setSending(true);

      const body: any = {
        title,
        location,
        price: Number(price) || 0,
        currency,
        propertyType,
        rooms: Number(rooms) || undefined,
        description,
        images: images
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
      };

      // Solo el admin puede establecer el plan al crear
      if (role === "admin") {
        body.plan = plan;
      }

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "No se pudo publicar");
      }

      // Si es agency, notificar al admin
      if (role === "agency") {
        try {
          await fetch("/api/notify-admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              listingTitle: title,
              listingId: data.id,
              agencyName: agencyName || "Inmobiliaria sin nombre",
            }),
          });
          console.log("✅ Admin notificado sobre nueva propiedad");
        } catch (e) {
          console.error("Error notificando al admin:", e);
          // No fallar si el email falla
        }
      }

      setOkMsg("Inmueble publicado correctamente.");
      // Limpio un poco
      setTitle("");
      setLocation("");
      setPrice("");
      setRooms("");
      setDescription("");
      setImages("");
      if (role === "admin") setPlan("free");
    } catch (err: any) {
      setError(err?.message || "Error al publicar");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: "24px 16px", maxWidth: 900, margin: "0 auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography sx={{ opacity: 0.8 }}>Verificando acceso…</Typography>
        </Box>
      </main>
    );
  }

  if (role !== "admin" && role !== "agency") {
    return (
      <main style={{ padding: "24px 16px", maxWidth: 900, margin: "0 auto" }}>
        <Alert severity="error">
          Acceso restringido. Ingresá con una cuenta de inmobiliaria o administrador.
        </Alert>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px 16px", maxWidth: 900, margin: "0 auto" }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
        Publicar inmueble
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {okMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {okMsg}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        }}
      >
        <TextField
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          sx={{ gridColumn: "1 / -1" }}
        />
        <TextField
          label="Ubicación"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Precio"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
          fullWidth
          required
        />
        <TextField
          select
          label="Moneda"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as "USD" | "ARS")}
          fullWidth
        >
          <MenuItem value="USD">USD</MenuItem>
          <MenuItem value="ARS">ARS</MenuItem>
        </TextField>

        <TextField
          select
          label="Tipo de propiedad"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value as PropertyType)}
          fullWidth
        >
          <MenuItem value="casa">Casa</MenuItem>
          <MenuItem value="depto">Departamento</MenuItem>
          <MenuItem value="lote">Lote</MenuItem>
          <MenuItem value="local">Local</MenuItem>
        </TextField>

        <TextField
          label="Ambientes"
          type="number"
          value={rooms}
          onChange={(e) => setRooms(e.target.value === "" ? "" : Number(e.target.value))}
          fullWidth
        />

        {/* PLAN – SOLO ADMIN LO VE */}
        {role === "admin" && (
          <TextField
            select
            label="Plan (visibilidad)"
            value={plan}
            onChange={(e) => setPlan(e.target.value as Plan)}
            fullWidth
          >
            <MenuItem value="free">FREE</MenuItem>
            <MenuItem value="pro">PRO</MenuItem>
            <MenuItem value="premium">PREMIUM</MenuItem>
          </TextField>
        )}

        <TextField
          label="URLs de imágenes (una por línea)"
          value={images}
          onChange={(e) => setImages(e.target.value)}
          fullWidth
          multiline
          minRows={4}
          sx={{ gridColumn: "1 / -1" }}
        />

        <TextField
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={4}
          sx={{ gridColumn: "1 / -1" }}
        />

        <Box sx={{ gridColumn: "1 / -1", mt: 1, textAlign: "right" }}>
          <Button
            type="submit"
            variant="contained"
            disabled={sending}
          >
            {sending ? "Publicando…" : "Publicar inmueble"}
          </Button>
        </Box>
      </Box>
    </main>
  );
}











