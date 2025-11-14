"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

type Doc = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  location: string;
  rooms?: number;
  propertyType: string;
  operationType: string;
  images?: string[];
  m2Total?: number;
  m2Cubiertos?: number;
  bathrooms?: number;
  bedrooms?: number;
  garage?: boolean;
};

export default function EditarInmueble() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Estados del formulario
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [currency, setCurrency] = useState<"USD" | "ARS">("USD");
  const [propertyType, setPropertyType] = useState<"depto" | "casa" | "lote" | "local">("casa");
  const [operationType, setOperationType] = useState<"venta" | "alquiler" | "temporario">("venta");
  const [rooms, setRooms] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string>("");
  const [m2Total, setM2Total] = useState<number | "">("");
  const [m2Cubiertos, setM2Cubiertos] = useState<number | "">("");
  const [bathrooms, setBathrooms] = useState<number | "">("");
  const [bedrooms, setBedrooms] = useState<number | "">("");
  const [garage, setGarage] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar");
        const data = await res.json();
        
        // Llenar el formulario con los datos existentes
        setTitle(data.title || "");
        setLocation(data.location || "");
        setPrice(data.price || "");
        setCurrency(data.currency || "USD");
        setPropertyType(data.propertyType || "casa");
        setOperationType(data.operationType || "venta");
        setRooms(data.rooms || "");
        setDescription(data.description || "");
        setImages(Array.isArray(data.images) ? data.images.join("\n") : "");
        setM2Total(data.m2Total || "");
        setM2Cubiertos(data.m2Cubiertos || "");
        setBathrooms(data.bathrooms || "");
        setBedrooms(data.bedrooms || "");
        setGarage(data.garage || false);
        
        setLoading(false);
      } catch (err) {
        setSnackbar({ open: true, message: "Error al cargar el inmueble", severity: "error" });
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setSending(true);
      
      const payload = {
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
        m2Total: Number(m2Total) || undefined,
        m2Cubiertos: Number(m2Cubiertos) || undefined,
        bathrooms: Number(bathrooms) || undefined,
        bedrooms: Number(bedrooms) || undefined,
        garage,
      };

      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al actualizar");

      setSnackbar({ open: true, message: "✅ Inmueble actualizado correctamente", severity: "success" });
      
      // Redirigir después de 1 segundo
      setTimeout(() => {
        router.push(`/inmuebles/${id}`);
      }, 1000);
      
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.message || "Error al actualizar", severity: "error" });
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este inmueble? Esta acción no se puede deshacer.")) return;
    
    try {
      setSending(true);
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Error al eliminar");
      }
      
      setSnackbar({ open: true, message: "✅ Inmueble eliminado", severity: "success" });
      
      setTimeout(() => {
        router.push("/inmuebles");
      }, 1000);
      
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.message || "Error al eliminar", severity: "error" });
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: "24px 16px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando datos del inmueble...</Typography>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px 16px", maxWidth: 900, margin: "0 auto" }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
        Editar inmueble
      </Typography>

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
          onChange={(e) => setPropertyType(e.target.value as "depto" | "casa" | "lote" | "local")}
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

        <TextField
          label="URLs de imágenes (una por línea)"
          value={images}
          onChange={(e) => setImages(e.target.value)}
          fullWidth
          multiline
          minRows={4}
          sx={{ gridColumn: "1 / -1" }}
          helperText="Pegá las URLs de las imágenes, una por línea"
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

        <Box sx={{ gridColumn: "1 / -1", mt: 1, display: "flex", gap: 2, justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            disabled={sending}
          >
            🗑️ Eliminar inmueble
          </Button>
          
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.push(`/inmuebles/${id}`)}
              disabled={sending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={sending}
            >
              {sending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </Box>
        </Box>
      </Box>

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
