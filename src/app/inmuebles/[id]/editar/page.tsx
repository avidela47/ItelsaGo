"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Divider,
  CircularProgress,
  Typography,
  Paper,
} from "@mui/material";
import ConfirmDeleteDialog from "@/components/cards/ConfirmDeleteDialog";
import MapPicker from "@/components/maps/MapPicker";
import ImageUploader from "@/components/upload/ImageUploader";

type Currency = "ARS" | "USD";
type PropertyType = "depto" | "casa" | "lote" | "local";
type OperationType = "venta" | "alquiler" | "temporario";
type AgencyPlan = "premium" | "pro" | "free";

type FormState = {
  title: string;
  location: string;
  price: string;
  currency: Currency;
  rooms: string;
  propertyType: PropertyType;
  operationType: OperationType;
  images: string[]; // Array de URLs
  description: string;
  agencyLogo: string; // URL del logo
  agencyPlan: AgencyPlan;
};

// Función para subir logo (solo se usa para el logo de la agencia)
async function uploadLocal(files: FileList): Promise<string[]> {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("files", f));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || !data?.ok) throw new Error(data?.error || "No se pudo subir");
  return data.urls as string[];
}

export default function EditarInmueblePage() {
  // ✅ FIX: tipamos de forma segura para evitar el error ts(2339)
  const params = useParams() as Record<string, string> | null;
  const id = params?.id ?? ""; // id siempre string

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [openDelete, setOpenDelete] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // Estado para geolocalización
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [f, setF] = useState<FormState>({
    title: "",
    location: "",
    price: "",
    currency: "ARS",
    rooms: "0",
    propertyType: "depto",
    operationType: "venta",
    images: [],
    description: "",
    agencyLogo: "",
    agencyPlan: "free",
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setF((s) => ({ ...s, [k]: v }));
  };
  
  // Eliminamos imageList ya que images ahora es array

  // Leer rol del localStorage
  useEffect(() => {
    const r = window.localStorage.getItem("role");
    setRole(r);
    // Permitir admin y agency
    if (r !== "admin" && r !== "agency") {
      router.push("/inmuebles");
    }
  }, [router]);

  useEffect(() => {
    if (!id) return; // sin id, evitamos fetch
    let ok = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listings/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data?.item) {
          setMsg({
            type: "err",
            text: data?.error || "No se pudo cargar",
          });
          return;
        }
        const it = data.item;
        if (!ok) return;
        setF({
          title: it.title || "",
          location: it.location || "",
          price: String(it.price ?? ""),
          currency: it.currency || "ARS",
          rooms: String(it.rooms ?? "0"),
          propertyType: it.propertyType || "depto",
          operationType: it.operationType || "venta",
          images: Array.isArray(it.images) ? it.images : [],
          description: it.description || "",
          agencyLogo: it.agency?.logo || "",
          agencyPlan: it.agency?.plan || "free",
        });
        
        // Cargar coordenadas si existen
        if (typeof it.lat === "number" && typeof it.lng === "number") {
          setMapLocation({
            lat: it.lat,
            lng: it.lng,
          });
        }
      } catch {
        setMsg({ type: "err", text: "Error de red" });
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !id) return;

    const errors: string[] = [];
    if (!f.title.trim()) errors.push("Título requerido");
    if (!f.location.trim()) errors.push("Ubicación requerida");
    const priceNum = Number(f.price);
    if (!priceNum || Number.isNaN(priceNum) || priceNum <= 0)
      errors.push("Precio inválido");
    if (f.images.length === 0) errors.push("Al menos 1 imagen válida");
    if (errors.length) {
      setMsg({ type: "err", text: errors.join(" · ") });
      return;
    }

    setBusy(true);
    setMsg(null);
    
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: f.title.trim(),
          location: f.location.trim(),
          price: priceNum,
          currency: f.currency,
          rooms: Number(f.rooms || 0),
          propertyType: f.propertyType,
          operationType: f.operationType,
          images: f.images, // Ya es array
          description: f.description,
          lat: mapLocation?.lat,
          lng: mapLocation?.lng,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setMsg({
          type: "err",
          text:
            data?.errors?.join?.(" · ") ||
            data?.error ||
            "No se pudo actualizar",
        });
        return;
      }
      setMsg({ type: "ok", text: "Guardado con éxito" });
      setTimeout(() => router.push(`/inmuebles/${id}`), 650);
    } catch {
      setMsg({ type: "err", text: "Error de red" });
    } finally {
      setBusy(false);
    }
  }

  async function doDelete() {
    if (!id) return;
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "No se pudo eliminar");
    router.push("/inmuebles");
  }

  async function handleLogoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const [logoUrl] = await uploadLocal(files);
      if (logoUrl) {
        set("agencyLogo", logoUrl);
        setMsg({ type: "ok", text: "Logo actualizado" });
      }
    } catch (err: any) {
      setMsg({
        type: "err",
        text: err?.message || "No se pudo subir el logo",
      });
    } finally {
      setBusy(false);
      e.currentTarget.value = "";
    }
  }

  return (
    <main
      style={{ padding: "24px 16px", maxWidth: 1100, margin: "0 auto" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <a
          href={id ? `/inmuebles/${id}` : "/inmuebles"}
          style={{ textDecoration: "none" }}
        >
          ← Volver
        </a>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
          Editar inmueble
        </h1>
        <span style={{ marginLeft: "auto" }} />
      </div>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          p: { xs: 2, md: 3 },
          background:
            "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02))",
          borderColor: "rgba(255,255,255,.12)",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} />
            <Typography sx={{ opacity: 0.8, fontSize: 14 }}>
              Cargando…
            </Typography>
          </Box>
        ) : (
          <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
            <Box sx={{ display: "grid", gap: 10 }}>
              <TextField
                required
                label="Título"
                value={f.title}
                onChange={(e) => set("title", e.target.value)}
                fullWidth
              />
              <TextField
                required
                label="Ubicación"
                value={f.location}
                onChange={(e) => set("location", e.target.value)}
                fullWidth
              />

              <Box
                sx={{
                  display: "grid",
                  gap: 10,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 150px 1fr" },
                }}
              >
                <TextField
                  required
                  label="Precio"
                  type="number"
                  value={f.price}
                  onChange={(e) => set("price", e.target.value)}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel id="currency-label">Moneda</InputLabel>
                  <Select
                    labelId="currency-label"
                    label="Moneda"
                    value={f.currency}
                    onChange={(e) =>
                      set("currency", e.target.value as Currency)
                    }
                  >
                    <MenuItem value="ARS">ARS</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Ambientes"
                  type="number"
                  value={f.rooms}
                  onChange={(e) => set("rooms", e.target.value)}
                  fullWidth
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 10,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                }}
              >
                <FormControl fullWidth>
                  <InputLabel id="type-label">Tipo</InputLabel>
                  <Select
                    labelId="type-label"
                    label="Tipo"
                    value={f.propertyType}
                    onChange={(e) =>
                      set("propertyType", e.target.value as PropertyType)
                    }
                  >
                    <MenuItem value="depto">Departamento</MenuItem>
                    <MenuItem value="casa">Casa</MenuItem>
                    <MenuItem value="lote">Lote</MenuItem>
                    <MenuItem value="local">Local</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="op-label">Operación</InputLabel>
                  <Select
                    labelId="op-label"
                    label="Operación"
                    value={f.operationType}
                    onChange={(e) =>
                      set("operationType", e.target.value as OperationType)
                    }
                  >
                    <MenuItem value="venta">Venta</MenuItem>
                    <MenuItem value="alquiler">Alquiler</MenuItem>
                    <MenuItem value="temporario">Temporario</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* COMPONENTE DE SUBIDA DE IMÁGENES */}
              <Box>
                <ImageUploader value={f.images} onChange={(urls) => set("images", urls)} maxImages={18} maxSizeMB={5} />
              </Box>

              <Divider flexItem sx={{ opacity: 0.2 }} />

              <TextField
                label="Descripción"
                multiline
                minRows={4}
                value={f.description}
                onChange={(e) => set("description", e.target.value)}
                fullWidth
              />

              {/* MAPA SELECTOR DE UBICACIÓN */}
              <Box>
                <MapPicker value={mapLocation} onChange={setMapLocation} height={350} />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 10,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 220px" },
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "grid", gap: 1 }}>
                  <TextField
                    label="Logo inmobiliaria (URL)"
                    placeholder="https://... o /uploads/logo.png"
                    value={f.agencyLogo}
                    onChange={(e) => set("agencyLogo", e.target.value)}
                    fullWidth
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoPick}
                    />
                    {f.agencyLogo ? (
                      <img
                        src={f.agencyLogo}
                        alt="logo"
                        style={{
                          width: 36,
                          height: 36,
                          objectFit: "contain",
                          borderRadius: 6,
                          background: "rgba(255,255,255,.8)",
                          padding: 2,
                          border: "1px solid rgba(0,0,0,.15)",
                        }}
                      />
                    ) : null}
                  </div>
                </Box>

                {/* Campo Plan solo visible para admin */}
                {role === "admin" && (
                  <FormControl fullWidth>
                    <InputLabel id="plan-label">Plan</InputLabel>
                    <Select
                      labelId="plan-label"
                      label="Plan"
                      value={f.agencyPlan}
                      onChange={(e) =>
                        set("agencyPlan", e.target.value as AgencyPlan)
                      }
                    >
                      <MenuItem value="free">Free</MenuItem>
                      <MenuItem value="pro">Pro</MenuItem>
                      <MenuItem value="premium">Premium</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>
            </Box>

            {msg && (
              <Alert severity={msg.type === "ok" ? "success" : "error"}>
                {msg.text}
              </Alert>
            )}

            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              {/* Botón eliminar solo visible para admin */}
              {role === "admin" && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setOpenDelete(true)}
                  disabled={busy}
                >
                  Eliminar
                </Button>
              )}
              <div style={{ display: "flex", gap: 12, marginLeft: "auto" }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() =>
                    router.push(id ? `/inmuebles/${id}` : "/inmuebles")
                  }
                  disabled={busy}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Paper>

      <ConfirmDeleteDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={async () => {
          await doDelete();
          setOpenDelete(false);
        }}
        title="Eliminar publicación"
        hint='Para confirmar, escribí "ELIMINAR" y luego presioná "Eliminar".'
        requireText="ELIMINAR"
      />
    </main>
  );
}



