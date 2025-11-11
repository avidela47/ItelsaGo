"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";

type Currency = "ARS" | "USD";
type PropertyType = "depto" | "casa" | "lote" | "local";
type OperationType = "venta" | "alquiler" | "temporario";
type AgencyPlan = "premium" | "sponsor" | "free";

export type Listing = {
  _id?: string;
  title: string;
  location: string;
  price: number;
  currency: Currency;
  rooms?: number;
  propertyType: PropertyType;
  operationType: OperationType;
  images: string[];
  description?: string;
  agency?: { logo?: string; plan: AgencyPlan; whatsapp?: string };
};

export default function ListingForm({
  initial,
  onSaved,
}: {
  initial?: Partial<Listing>;
  onSaved: (id?: string) => void;
}) {
  const [f, setF] = useState<Listing>({
    title: initial?.title || "",
    location: initial?.location || "",
    price: initial?.price || 0,
    currency: (initial?.currency as Currency) || "ARS",
    rooms: initial?.rooms || 0,
    propertyType: (initial?.propertyType as PropertyType) || "depto",
    operationType: (initial?.operationType as OperationType) || "venta",
    images: initial?.images || [],
    description: initial?.description || "",
    agency: {
      logo: initial?.agency?.logo || "",
      plan: (initial?.agency?.plan as AgencyPlan) || "free",
      whatsapp: initial?.agency?.whatsapp || "",
    },
  });

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const handle = <K extends keyof Listing>(k: K, v: Listing[K]) => setF(s => ({ ...s, [k]: v }));

  async function uploadLocal(files: FileList) {
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || "No se pudo subir");
    return data.urls as string[];
  }

  async function onPickImages(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setBusy(true);
    try {
      const urls = await uploadLocal(e.target.files);
      handle("images", [...f.images, ...urls]);
      setMsg({ type: "ok", text: `Subidas ${urls.length} imágenes` });
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Fallo al subir" });
    } finally {
      setBusy(false);
      e.currentTarget.value = "";
    }
  }

  async function onPickLogo(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setBusy(true);
    try {
      const [url] = await uploadLocal(e.target.files);
      handle("agency", { ...(f.agency || { plan: "free" }), logo: url, whatsapp: f.agency?.whatsapp || "" });
      setMsg({ type: "ok", text: "Logo actualizado" });
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Fallo al subir" });
    } finally {
      setBusy(false);
      e.currentTarget.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!f.title.trim() || !f.location.trim() || !Number(f.price) || f.images.length === 0) {
      setMsg({ type: "err", text: "Completá título, ubicación, precio e imágenes" });
      return;
    }

    setBusy(true); setMsg(null);
    const body = {
      title: f.title.trim(),
      location: f.location.trim(),
      price: Number(f.price),
      currency: f.currency,
      rooms: Number(f.rooms || 0),
      propertyType: f.propertyType,
      operationType: f.operationType,
      images: f.images,
      description: f.description,
      agency: {
        logo: f.agency?.logo || "",
        plan: f.agency?.plan || "free",
        whatsapp: f.agency?.whatsapp || "",
      },
    };

    try {
      const isEdit = !!initial?._id;
      const url = isEdit ? `/api/listings/${initial!._id}` : "/api/listings";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.errors?.join?.(" · ") || "Error");
      setMsg({ type: "ok", text: isEdit ? "Actualizado" : "Creado" });
      onSaved(data?.id || initial?._id);
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <Box sx={{ display: "grid", gap: 12, gridTemplateColumns: { xs: "1fr", md: "1fr 140px 1fr" } }}>
        <TextField label="Título" required value={f.title} onChange={e => handle("title", e.target.value)} />
        <FormControl fullWidth>
          <InputLabel id="currency">Moneda</InputLabel>
          <Select labelId="currency" label="Moneda" value={f.currency} onChange={e => handle("currency", e.target.value as any)}>
            <MenuItem value="ARS">ARS</MenuItem><MenuItem value="USD">USD</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Precio" required type="number" value={f.price} onChange={e => handle("price", Number(e.target.value))} />
      </Box>

      <Box sx={{ display: "grid", gap: 12, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <TextField label="Ubicación" required value={f.location} onChange={e => handle("location", e.target.value)} />
        <TextField label="Ambientes" type="number" value={f.rooms} onChange={e => handle("rooms", Number(e.target.value))} />
      </Box>

      <Box sx={{ display: "grid", gap: 12, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <FormControl fullWidth>
          <InputLabel id="type">Tipo</InputLabel>
          <Select labelId="type" label="Tipo" value={f.propertyType} onChange={e => handle("propertyType", e.target.value as any)}>
            <MenuItem value="depto">Departamento</MenuItem>
            <MenuItem value="casa">Casa</MenuItem>
            <MenuItem value="lote">Lote</MenuItem>
            <MenuItem value="local">Local</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="op">Operación</InputLabel>
          <Select labelId="op" label="Operación" value={f.operationType} onChange={e => handle("operationType", e.target.value as any)}>
            <MenuItem value="venta">Venta</MenuItem>
            <MenuItem value="alquiler">Alquiler</MenuItem>
            <MenuItem value="temporario">Temporario</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TextField
        label="Descripción"
        multiline minRows={4}
        value={f.description}
        onChange={e => handle("description", e.target.value)}
      />

      <Divider flexItem />

      {/* imágenes */}
      <Box sx={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Button variant="outlined" component="label" disabled={busy}>
            Subir imágenes
            <input type="file" accept="image/*" multiple hidden onChange={onPickImages} />
          </Button>
          <small style={{ opacity: .75 }}>{f.images.length} imágenes cargadas</small>
        </div>
        {f.images.length > 0 && (
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))" }}>
            {f.images.map((src, i) => (
              <div key={i} style={{ position: "relative", paddingTop: "66%", borderRadius: 10, overflow: "hidden",
                border: "1px solid rgba(255,255,255,.12)" }}>
                <img src={src} alt={`img-${i}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}
      </Box>

      {/* logo + plan + whatsapp */}
      <Box sx={{ display: "grid", gap: 12, gridTemplateColumns: { xs: "1fr", md: "1fr 220px" }, alignItems: "center" }}>
        <Box sx={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Button variant="outlined" component="label" disabled={busy}>
              Subir logo
              <input type="file" accept="image/*" hidden onChange={onPickLogo} />
            </Button>
            {f.agency?.logo ? <img src={f.agency.logo} alt="logo" style={{ width: 40, height: 40, objectFit: "contain",
              background: "rgba(255,255,255,.85)", borderRadius: 6, padding: 2, border: "1px solid rgba(0,0,0,.12)" }} /> : null}
          </div>
          <TextField
            label="WhatsApp (solo dígitos, con código país. Ej: 549351xxxxxxx)"
            value={f.agency?.whatsapp || ""}
            onChange={e => handle("agency", { ...(f.agency || { plan: "free" }), logo: f.agency?.logo || "", whatsapp: e.target.value })}
          />
        </Box>

        <FormControl fullWidth>
          <InputLabel id="plan">Plan</InputLabel>
          <Select labelId="plan" label="Plan" value={f.agency?.plan || "free"}
            onChange={e => handle("agency", { ...(f.agency || {}), plan: e.target.value as any })}>
            <MenuItem value="free">Free</MenuItem>
            <MenuItem value="sponsor">Sponsor</MenuItem>
            <MenuItem value="premium">Premium</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {msg && <Alert severity={msg.type === "ok" ? "success" : "error"}>{msg.text}</Alert>}

      <Box sx={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <Button type="submit" disabled={busy}>{busy ? <CircularProgress size={18}/> : "Guardar"}</Button>
      </Box>
    </form>
  );
}

