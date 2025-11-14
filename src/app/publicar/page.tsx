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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";

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
  
  // Info del plan y límites
  const [agencyPlan, setAgencyPlan] = useState<Plan>("free");
  const [propertiesCount, setPropertiesCount] = useState<number>(0);
  const [propertiesLimit, setPropertiesLimit] = useState<number>(3);

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
    
    // Si es agency, obtener el nombre de la inmobiliaria y el plan
    if (r === "agency") {
      const name = window.localStorage.getItem("name") || 
                   document.cookie.match(/(?:^|;)\s*name=([^;]+)/)?.[1] || "";
      setAgencyName(decodeURIComponent(name));
      
      // Obtener info del plan y propiedades
      fetchAgencyInfo();
    }
  }, [router]);

  async function fetchAgencyInfo() {
    try {
      const res = await fetch("/api/user/agency-info");
      if (res.ok) {
        const data = await res.json();
        setAgencyPlan(data.plan || "free");
        setPropertiesCount(data.propertiesCount || 0);
        setPropertiesLimit(data.limit || 3);
      }
    } catch (e) {
      console.error("Error obteniendo info de agency:", e);
    }
  }

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

  const getPlanColor = (plan: string) => {
    if (plan === "premium") return "#D9A441";
    if (plan === "pro") return "#2A6EBB";
    return "#4CAF50";
  };

  const remaining = propertiesLimit - propertiesCount;
  const percentageUsed = (propertiesCount / propertiesLimit) * 100;

  return (
    <main style={{ padding: "24px 16px", maxWidth: 900, margin: "0 auto" }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
        Publicar inmueble
      </Typography>

      {/* Indicador de plan (solo para agencies) */}
      {role === "agency" && (
        <Card sx={{ mb: 3, bgcolor: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" fontWeight={700}>Tu Plan</Typography>
                <Chip
                  label={agencyPlan.toUpperCase()}
                  sx={{
                    bgcolor: getPlanColor(agencyPlan),
                    color: "#fff",
                    fontWeight: 700,
                  }}
                />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                {propertiesCount} / {propertiesLimit === 999999 ? "∞" : propertiesLimit}
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={Math.min(percentageUsed, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "rgba(255,255,255,.1)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: getPlanColor(agencyPlan),
                },
              }}
            />
            
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              {remaining > 0 ? (
                <>
                  Te {remaining === 1 ? "queda" : "quedan"} <strong>{remaining}</strong> {remaining === 1 ? "propiedad" : "propiedades"} disponible{remaining === 1 ? "" : "s"}
                </>
              ) : propertiesLimit === 999999 ? (
                <>Propiedades ilimitadas</>
              ) : (
                <>⚠️ Alcanzaste el límite de tu plan. Contactá al administrador para subir de plan.</>
              )}
            </Typography>
          </CardContent>
        </Card>
      )}

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











