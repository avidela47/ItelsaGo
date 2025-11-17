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
import Snackbar from "@mui/material/Snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import PropertyCard from "@/components/cards/PropertyCard";
import MapPicker from "@/components/maps/MapPicker";

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
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
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
  const [operationType, setOperationType] = useState<"venta" | "alquiler" | "temporario">("venta");
  const [rooms, setRooms] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string>("");
  const [plan, setPlan] = useState<Plan>("free"); // por defecto free
  const [openPreview, setOpenPreview] = useState(false);
  
  // Nuevos campos
  const [m2Total, setM2Total] = useState<number | "">("");
  const [m2Cubiertos, setM2Cubiertos] = useState<number | "">("");
  const [bathrooms, setBathrooms] = useState<number | "">("");
  const [bedrooms, setBedrooms] = useState<number | "">("");
  const [garage, setGarage] = useState(false);
  
  // Geolocalización
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);

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

    try {
      setSending(true);

      const body: any = {
        title,
        location,
        price: Number(price) || 0,
        currency,
        propertyType,
        operationType,
        rooms: Number(rooms) || undefined,
        description,
        images: images
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        
        // Nuevos campos
        m2Total: Number(m2Total) || undefined,
        m2Cubiertos: Number(m2Cubiertos) || undefined,
        bathrooms: Number(bathrooms) || undefined,
        bedrooms: Number(bedrooms) || undefined,
        garage,
        
        // Geolocalización
        lat: mapLocation?.lat,
        lng: mapLocation?.lng,
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

      setSnackbar({ open: true, message: "✅ Inmueble publicado correctamente", severity: "success" });
      
      // Refrescar info del plan si es agency
      if (role === "agency") {
        fetchAgencyInfo();
      }
      
      // Limpio formulario
      setTitle("");
      setLocation("");
      setPrice("");
      setRooms("");
      setDescription("");
      setImages("");
      setM2Total("");
      setM2Cubiertos("");
      setBathrooms("");
      setBedrooms("");
      setGarage(false);
      setMapLocation(null);
      setOperationType("venta");
      if (role === "admin") setPlan("free");
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.message || "Error al publicar", severity: "error" });
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

        <TextField
          select
          label="Tipo de operación"
          value={operationType}
          onChange={(e) => setOperationType(e.target.value as "venta" | "alquiler" | "temporario")}
          fullWidth
        >
          <MenuItem value="venta">Venta</MenuItem>
          <MenuItem value="alquiler">Alquiler</MenuItem>
          <MenuItem value="temporario">Temporario</MenuItem>
        </TextField>

        <TextField
          label="M² Totales"
          type="number"
          value={m2Total}
          onChange={(e) => setM2Total(e.target.value === "" ? "" : Number(e.target.value))}
          fullWidth
          helperText="Superficie total del terreno"
        />

        <TextField
          label="M² Cubiertos"
          type="number"
          value={m2Cubiertos}
          onChange={(e) => setM2Cubiertos(e.target.value === "" ? "" : Number(e.target.value))}
          fullWidth
          helperText="Superficie construida"
        />

        <TextField
          label="Dormitorios"
          type="number"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value === "" ? "" : Number(e.target.value))}
          fullWidth
        />

        <TextField
          label="Baños"
          type="number"
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value === "" ? "" : Number(e.target.value))}
          fullWidth
        />

        <TextField
          select
          label="Cochera"
          value={garage ? "true" : "false"}
          onChange={(e) => setGarage(e.target.value === "true")}
          fullWidth
        >
          <MenuItem value="false">No</MenuItem>
          <MenuItem value="true">Sí</MenuItem>
        </TextField>

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
          helperText="Pegá las URLs de las imágenes, una por línea. Se mostrarán abajo."
        />

        {/* Previsualización de imágenes */}
        {images.trim() && (
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography variant="body2" sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}>
              Vista previa de imágenes:
            </Typography>
            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", 
              gap: 1 
            }}>
              {images.split("\n").filter(url => url.trim()).map((url, idx) => (
                <Box
                  key={idx}
                  sx={{
                    position: "relative",
                    aspectRatio: "16/10",
                    borderRadius: 1,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,.12)",
                    bgcolor: "rgba(255,255,255,.03)",
                  }}
                >
                  <img
                    src={url.trim()}
                    alt={`Preview ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        parent.style.display = "flex";
                        parent.style.alignItems = "center";
                        parent.style.justifyContent = "center";
                        parent.innerHTML = '<span style="color: #f44336; font-size: 12px;">❌ Error</span>';
                      }
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0,0,0,.7)",
                      color: "#fff",
                      px: 0.8,
                      py: 0.3,
                      borderRadius: 0.5,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {idx + 1}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <TextField
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={4}
          sx={{ gridColumn: "1 / -1" }}
        />

        {/* MAPA SELECTOR DE UBICACIÓN */}
        <Box sx={{ gridColumn: "1 / -1" }}>
          <MapPicker value={mapLocation} onChange={setMapLocation} height={350} />
        </Box>

        <Box sx={{ gridColumn: "1 / -1", mt: 1, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={() => setOpenPreview(true)}
            disabled={!title || !location || !price}
          >
            👁️ Vista Previa
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={sending}
          >
            {sending ? "Publicando…" : "Publicar inmueble"}
          </Button>
        </Box>
      </Box>

      {/* Dialog de Vista Previa */}
      <Dialog 
        open={openPreview} 
        onClose={() => setOpenPreview(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Vista Previa del Inmueble</DialogTitle>
        <DialogContent>
          <PropertyCard
            item={{
              _id: "preview",
              title: title || "Título del inmueble",
              price: Number(price) || 0,
              currency: currency,
              location: location || "Ubicación",
              images: images ? images.split("\n").filter(Boolean) : [],
              rooms: Number(rooms) || undefined,
              propertyType: propertyType,
              operationType: operationType,
              m2Total: Number(m2Total) || undefined,
              m2Cubiertos: Number(m2Cubiertos) || undefined,
              bathrooms: Number(bathrooms) || undefined,
              bedrooms: Number(bedrooms) || undefined,
              garage: garage,
              agency: role === "agency" 
                ? { 
                    plan: agencyPlan, 
                    logo: undefined, 
                    whatsapp: undefined 
                  } 
                : { 
                    plan: plan, 
                    logo: undefined, 
                    whatsapp: undefined 
                  },
            }}
          />
          <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.secondary" }}>
            ℹ️ Esta es una vista previa. El inmueble se verá así una vez publicado.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </main>
  );
}











