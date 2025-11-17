"use client";

import { useMemo } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

export type Plan = "all" | "premium" | "pro" | "free";
export type PropertyType = "all" | "depto" | "casa" | "lote" | "local";
export type SortKey = "recent" | "price_asc" | "price_desc" | "rooms_desc";

export type FilterState = {
  q: string;
  sort: SortKey;
  plan: Plan;
  location: string;      // "all" o una ubicación
  type: PropertyType;    // "all" o tipo
  price: [number, number];
  rooms: string;         // "all" o número en string
};

type Item = {
  _id: string;
  title: string;
  price: number;
  currency: "ARS" | "USD";
  location: string;
  rooms?: number;
  propertyType?: "depto" | "casa" | "lote" | "local";
  agency?: { plan?: "premium" | "pro" | "sponsor" | "free" };
  createdAt?: string;
};

type Props = {
  value: FilterState;
  onChange: (f: FilterState) => void;
  items: Item[];
  onPlanesClick: () => void;
};

function numberOrZero(n?: number) {
  return typeof n === "number" && !Number.isNaN(n) ? n : 0;
}

export default function FiltersBar({ value, onChange, items, onPlanesClick }: Props) {
  // Opciones dinámicas a partir de los datos
  const { minPrice, maxPrice, locations, types } = useMemo(() => {
    const prices = items.map((i) => numberOrZero(i.price)).filter((n) => n > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 1000000;

    const locs = Array.from(
      new Set(
        items
          .map((i) => (i.location || "").trim())
          .filter((x) => x && x.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b));

    const types = Array.from(
      new Set(
        items
          .map((i) => (i.propertyType || "").trim())
          .filter((x) => ["depto", "casa", "lote", "local"].includes(x))
      )
    ) as Array<"depto" | "casa" | "lote" | "local">;

    return { minPrice, maxPrice, locations: locs, types };
  }, [items]);

  // Helpers para setear campos
  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    onChange({ ...value, [k]: v });

  const resetAll = () =>
    onChange({
      q: "",
      sort: "recent",
      plan: "all",
      location: "all",
      type: "all",
      price: [minPrice, maxPrice],
      rooms: "all",
    });

  const showReset =
    value.q ||
    value.sort !== "recent" ||
    value.plan !== "all" ||
    value.location !== "all" ||
    value.type !== "all" ||
    value.rooms !== "all" ||
    value.price[0] !== (value.price ? value.price[0] : minPrice) ||
    value.price[1] !== (value.price ? value.price[1] : maxPrice);

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr auto auto auto auto",
        },
        alignItems: "center",
        mb: 2,
        p: 2,
        borderRadius: 4,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(4px)",
        color: "#e9edf2",
        '& .MuiInputBase-root, & .MuiSelect-select, & .MuiChip-root': { color: '#f0f4f8' },
        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
        '& .MuiSlider-track': { backgroundColor: '#69d4ff' },
        '& .MuiSlider-thumb': { backgroundColor: '#ffffff', boxShadow: '0 0 0 3px rgba(0,0,0,0.3)' },
        '& .MuiChip-filledPrimary': { background: 'linear-gradient(135deg,#2be4ff,#36b5ff)', color: '#061016' },
        '& .MuiChip-outlined': { borderColor: 'rgba(255,255,255,0.25)' },
      }}
    >
      {/* BÚSQUEDA */}
      <TextField
        placeholder="Buscar por título o ubicación…"
        value={value.q}
        onChange={(e) => set("q", e.target.value)}
        size="medium"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* ORDEN */}
      <FormControl size="medium" sx={{ minWidth: 180 }}>
        <InputLabel id="sort-label">Ordenar por</InputLabel>
        <Select
          labelId="sort-label"
          label="Ordenar por"
          value={value.sort}
          onChange={(e) => set("sort", e.target.value as SortKey)}
        >
          <MenuItem value="recent">Más recientes</MenuItem>
          <MenuItem value="price_asc">Precio: menor a mayor</MenuItem>
          <MenuItem value="price_desc">Precio: mayor a menor</MenuItem>
          <MenuItem value="rooms_desc">Ambientes: mayor a menor</MenuItem>
        </Select>
      </FormControl>

      {/* BOTÓN PLANES */}
      <Button
        variant="contained"
        size="medium"
        onClick={onPlanesClick}
        sx={{
          background: "linear-gradient(135deg,rgba(0,208,255,.25),rgba(0,255,225,.18))",
          border: "1px solid rgba(0,208,255,.45)",
          color: "#e9eef5",
          fontWeight: 700,
          textTransform: "none",
          whiteSpace: "nowrap",
          px: 3,
          "&:hover": {
            background: "linear-gradient(135deg,rgba(0,208,255,.35),rgba(0,255,225,.28))",
          },
        }}
      >
        Planes
      </Button>

      {/* PLAN (chips) */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {(["all", "premium", "pro", "free"] as Plan[]).map((p) => {
          const planColors = {
            all: { 
              bg: "linear-gradient(135deg,rgba(0,208,255,.25),rgba(0,255,225,.18))", 
              border: "rgba(0,208,255,.45)",
              solid: "#00d0ff",
              hover: "linear-gradient(135deg,rgba(0,208,255,.35),rgba(0,255,225,.28))"
            },
            premium: { 
              bg: "#D9A441", 
              border: "#D9A441",
              solid: "#D9A441",
              hover: "#C89331"
            },
            pro: { 
              bg: "#2A6EBB", 
              border: "#2A6EBB",
              solid: "#2A6EBB",
              hover: "#1F5AAA"
            },
            free: { 
              bg: "#4CAF50", 
              border: "#4CAF50",
              solid: "#4CAF50",
              hover: "#3D9840"
            },
          };
          
          return (
            <Chip
              key={p}
              label={p === "all" ? "Todos" : p.toUpperCase()}
              variant={value.plan === p ? "filled" : "outlined"}
              color="default"
              onClick={() => set("plan", p)}
              sx={{
                fontWeight: 700,
                ...(value.plan === p && {
                  background: planColors[p].bg,
                  border: `1px solid ${planColors[p].border}`,
                  color: "#ffffff",
                  "&:hover": {
                    background: planColors[p].hover,
                    opacity: 0.9,
                  },
                }),
                ...(!value.plan || value.plan !== p) && {
                  borderColor: planColors[p].border,
                  color: planColors[p].solid,
                  "&:hover": {
                    background: planColors[p].hover,
                    borderColor: planColors[p].border,
                  },
                },
              }}
            />
          );
        })}
      </Box>

      {/* RESET */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Limpiar filtros">
          <span>
            <IconButton
              onClick={resetAll}
              disabled={!showReset}
              size="medium"
              color="inherit"
            >
              <ClearRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* FILTROS SECUNDARIOS (fila 2) */}
      <Box
        sx={{
          gridColumn: "1 / -1",
          display: "grid",
          gap: 1,
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(4, 1fr)",
          },
          alignItems: "center",
        }}
      >
        {/* Ubicación */}
        <FormControl size="small" fullWidth>
          <InputLabel id="loc-label">Ubicación</InputLabel>
          <Select
            labelId="loc-label"
            label="Ubicación"
            value={value.location}
            onChange={(e) => set("location", e.target.value)}
          >
            <MenuItem value="all">Todas</MenuItem>
            {locations.map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Tipo */}
        <FormControl size="small" fullWidth>
          <InputLabel id="type-label">Tipo</InputLabel>
          <Select
            labelId="type-label"
            label="Tipo"
            value={value.type}
            onChange={(e) => set("type", e.target.value as PropertyType)}
          >
            <MenuItem value="all">Todos</MenuItem>
            {["depto", "casa", "lote", "local"].map((t) => (
              <MenuItem key={t} value={t}>
                {t === "depto" ? "Departamento" : t.charAt(0).toUpperCase() + t.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Dormitorios */}
        <FormControl size="small" fullWidth>
          <InputLabel id="rooms-label">Ambientes</InputLabel>
          <Select
            labelId="rooms-label"
            label="Ambientes"
            value={value.rooms}
            onChange={(e) => set("rooms", e.target.value)}
          >
            <MenuItem value="all">Todos</MenuItem>
            {[1, 2, 3, 4, 5].map((n) => (
              <MenuItem key={n} value={String(n)}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Precio */}
        <Box sx={{ px: 1 }}>
          <Box sx={{ fontSize: 12, opacity: 0.75, mb: 0.5 }}>
            Precio (mín–máx)
          </Box>
          <Slider
            value={value.price}
            onChange={(_, v) => set("price", v as [number, number])}
            min={minPrice}
            max={maxPrice}
            valueLabelDisplay="auto"
            size="small"
            sx={{ mt: 0.5 }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.75 }}>
            <span>{Intl.NumberFormat("es-AR").format(value.price[0])}</span>
            <span>{Intl.NumberFormat("es-AR").format(value.price[1])}</span>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}


