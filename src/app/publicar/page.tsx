"use client";

import { useRef, useState, forwardRef, useMemo } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme,
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";

type Currency = "ARS" | "USD";
type PropertyType = "depto" | "casa" | "lote" | "local";
type OperationType = "venta" | "alquiler" | "temporario";
type AgencyPlan = "premium" | "sponsor" | "free";

type FormState = {
  title: string;
  location: string;
  price: string;
  currency: Currency;
  rooms: string;
  propertyType: PropertyType;
  operationType: OperationType;
  images: string;       // URLs separadas por coma
  description: string;
  agencyLogo: string;   // URL del logo
  agencyPlan: AgencyPlan;
};

const Transition = forwardRef(function Transition(props: any, ref: any) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function newKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// util seguro para parsear las URLs separadas por coma
const splitUrls = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x && /^(https?:)?\/\//i.test(x));

export default function PublicarPage() {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [open, setOpen] = useState(true);

  const [f, setF] = useState<FormState>({
    title: "",
    location: "",
    price: "",
    currency: "ARS",
    rooms: "0",
    propertyType: "depto",
    operationType: "venta",
    images: "",
    description: "",
    agencyLogo: "",
    agencyPlan: "free",
  });

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const idemRef = useRef<string>(newKey());

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF((s) => ({ ...s, [k]: v }));

  const imageList = useMemo(() => splitUrls(f.images).slice(0, 8), [f.images]);
  const hasLogo = useMemo(() => !!f.agencyLogo && /^(https?:)?\/\//i.test(f.agencyLogo), [f.agencyLogo]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    // Validación mínima (visible pero no invasiva)
    const errors: string[] = [];
    if (!f.title.trim()) errors.push("Título es obligatorio");
    if (!f.location.trim()) errors.push("Ubicación es obligatoria");
    const priceNum = Number(f.price);
    if (!priceNum || Number.isNaN(priceNum) || priceNum <= 0) errors.push("Precio debe ser mayor a 0");
    if (imageList.length === 0) errors.push("Agregá al menos 1 URL de imagen válida (http/https)");

    if (errors.length) {
      setMsg({ type: "err", text: errors.join(" · ") });
      return;
    }

    setBusy(true);
    setMsg(null);
    setNewId(null);
    try {
      const key = idemRef.current;
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": key,
        },
        body: JSON.stringify({
          idempotencyKey: key,
          title: f.title.trim(),
          location: f.location.trim(),
          price: priceNum,
          currency: f.currency,
          rooms: Number(f.rooms || 0),
          propertyType: f.propertyType,
          operationType: f.operationType,
          images: imageList, // ya limpio
          description: f.description,
          agency: f.agencyLogo
            ? { logo: f.agencyLogo, plan: f.agencyPlan }
            : { plan: f.agencyPlan },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const text = data?.errors?.join(" · ") || data?.error || "Error al publicar";
        setMsg({ type: "err", text });
      } else {
        setMsg({
          type: "ok",
          text: data?.dedup ? "Ya estaba creada (idempotente)" : "Publicación creada con éxito",
        });
        if (data?.id) setNewId(data.id);
        setF((s) => ({ ...s, title: "", images: "", price: "", description: "" }));
        idemRef.current = newKey();
      }
    } catch {
      setMsg({ type: "err", text: "Error de red" });
    } finally {
      setBusy(false);
    }
  }

  // estilos de plan (visual pro)
  const planChip = (plan: AgencyPlan) => {
    const common = { sx: { fontWeight: 700, color: "#0b0b0f" } as any };
    if (plan === "premium")
      return (
        <Chip
          icon={<WorkspacePremiumRoundedIcon />}
          label="PREMIUM"
          {...common}
          sx={{
            ...common.sx,
            bgcolor: "#ffd54d",
            border: "1px solid rgba(0,0,0,.2)",
          }}
          size="small"
        />
      );
    if (plan === "sponsor")
      return (
        <Chip
          icon={<BoltRoundedIcon />}
          label="SPONSOR"
          {...common}
          sx={{ ...common.sx, bgcolor: "#22d3ee" }}
          size="small"
        />
      );
    return (
      <Chip
        icon={<StarRoundedIcon />}
        label="FREE"
        {...common}
        sx={{ ...common.sx, bgcolor: "#b0bec5" }}
        size="small"
      />
    );
  };

  return (
    <Dialog
      open={open}
      onClose={() => (busy ? null : setOpen(false))}
      TransitionComponent={Transition}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 4,
          overflow: "hidden",
          // look moderno (glass)
          background:
            "linear-gradient(180deg, rgba(20,22,27,.95) 0%, rgba(12,14,18,.96) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,.08)",
          boxShadow:
            "0 18px 60px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.05)",
          maxHeight: "92vh",
        },
      }}
    >
      {/* HEADER FIJO */}
      <DialogTitle
        sx={{
          py: 1.25,
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          borderBottom: "1px solid rgba(255,255,255,.08)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,0))",
        }}
      >
        <img
          src="/logo-itelsa-go.svg"
          alt="ITELSA Go"
          style={{ height: 24, width: "auto" }}
        />
        <Box component="span" sx={{ fontWeight: 800, fontSize: 18 }}>
          Publicar inmueble
        </Box>

        <Box sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center" }}>
          <Tooltip title="Plan que se guardará en la publicación">
            {planChip(f.agencyPlan)}
          </Tooltip>
          <IconButton
            aria-label="Cerrar"
            onClick={() => (busy ? null : setOpen(false))}
            sx={{ color: "rgba(255,255,255,.9)" }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* FORM + SCROLL INTERNO SUAVE */}
      <Box component="form" onSubmit={submit}>
        <DialogContent
          dividers
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            overflowY: "auto",
            maxHeight: { xs: "calc(92vh - 104px)", md: "calc(92vh - 116px)" },
            "&::-webkit-scrollbar": { width: 10 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(255,255,255,.18)",
              borderRadius: 8,
            },
          }}
        >
          <Box sx={{ display: "grid", gap: 6 }}>
            {/* Bloque 1 */}
            <Box sx={{ display: "grid", gap: 6 }}>
              <TextField
                required
                label="Título"
                placeholder="Depto 2D con balcón"
                value={f.title}
                onChange={(e) => set("title", e.target.value)}
                fullWidth
              />

              <TextField
                required
                label="Ubicación"
                placeholder="Nueva Córdoba"
                value={f.location}
                onChange={(e) => set("location", e.target.value)}
                fullWidth
              />

              <Box
                sx={{
                  display: "grid",
                  gap: 6,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 140px 1fr" },
                }}
              >
                <TextField
                  required
                  label="Precio"
                  type="number"
                  placeholder="145000"
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
                    onChange={(e) => set("currency", e.target.value as Currency)}
                  >
                    <MenuItem value="ARS">ARS</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Ambientes"
                  type="number"
                  placeholder="2"
                  value={f.rooms}
                  onChange={(e) => set("rooms", e.target.value)}
                  fullWidth
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 6,
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

              <TextField
                required
                label="Imágenes (URLs separadas por coma)"
                placeholder="https://.../img1.jpg, https://.../img2.jpg"
                value={f.images}
                onChange={(e) => set("images", e.target.value)}
                fullWidth
              />

              {/* PREVIEW DE IMÁGENES */}
              {imageList.length > 0 && (
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  <Box sx={{ fontSize: 12, opacity: 0.8 }}>Previsualización</Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(3, 1fr)",
                        sm: "repeat(4, 1fr)",
                      },
                      gap: 1,
                    }}
                  >
                    {imageList.map((src, i) => (
                      <Box
                        key={i}
                        sx={{
                          position: "relative",
                          pt: "75%", // 4:3
                          borderRadius: 1.5,
                          overflow: "hidden",
                          border: "1px solid rgba(255,255,255,.1)",
                          backgroundColor: "rgba(255,255,255,.03)",
                        }}
                      >
                        {/* uso <img> para no depender de next/image domains */}
                        <img
                          src={src}
                          alt={`img-${i}`}
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          loading="lazy"
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            <Divider flexItem sx={{ opacity: 0.2 }} />

            {/* Bloque 2 */}
            <Box sx={{ display: "grid", gap: 6 }}>
              <TextField
                label="Descripción"
                multiline
                minRows={4}
                value={f.description}
                onChange={(e) => set("description", e.target.value)}
                fullWidth
              />

              <Box
                sx={{
                  display: "grid",
                  gap: 6,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 220px" },
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "grid", gap: 1 }}>
                  <TextField
                    label="Logo inmobiliaria (URL opcional)"
                    placeholder="https://.../logo.png"
                    value={f.agencyLogo}
                    onChange={(e) => set("agencyLogo", e.target.value)}
                    fullWidth
                  />
                  {/* PREVIEW DEL LOGO */}
                  {hasLogo && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        border: "1px solid rgba(255,255,255,.08)",
                        borderRadius: 1.5,
                        width: "100%",
                        maxWidth: 280,
                        background: "rgba(255,255,255,.03)",
                      }}
                    >
                      <img
                        src={f.agencyLogo}
                        alt="logo agencia"
                        style={{
                          width: 36,
                          height: 36,
                          objectFit: "contain",
                          borderRadius: 6,
                          background: "rgba(255,255,255,.06)",
                        }}
                      />
                      <Box sx={{ fontSize: 12, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {f.agencyLogo}
                      </Box>
                    </Box>
                  )}
                </Box>

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
                    <MenuItem value="sponsor">Sponsor</MenuItem>
                    <MenuItem value="premium">Premium</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {msg && (
              <Alert
                severity={msg.type === "ok" ? "success" : "error"}
                sx={{ mt: 1 }}
              >
                {msg.text}
              </Alert>
            )}
          </Box>
        </DialogContent>

        {/* FOOTER FIJO */}
        <DialogActions
          sx={{
            py: 1.25,
            px: { xs: 2, md: 3 },
            borderTop: "1px solid rgba(255,255,255,.08)",
            background:
              "linear-gradient(0deg, rgba(255,255,255,.05), rgba(255,255,255,0))",
            position: "sticky",
            bottom: 0,
            zIndex: 1,
          }}
        >
          {newId && (
            <Button
              href={`/inmuebles/${newId}`}
              variant="outlined"
              sx={{ mr: "auto" }}
            >
              Ver publicación
            </Button>
          )}
          <Button
            onClick={() => setOpen(false)}
            variant="outlined"
            color="inherit"
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Publicando..." : "Publicar"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}









