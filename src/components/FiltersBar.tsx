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
export type SortKey = "recent" | "price_asc" | "price_desc" | "rooms_desc" | "m2_desc";

export type FilterState = {
  q: string;
  sort: SortKey;
  plan: Plan;
  location: string;      // "all" o una ubicación
  type: PropertyType;    // "all" o tipo
  price: [number, number];
  rooms: string;         // "all" o número en string
  m2Total: [number, number];  // Rango de m² totales
  m2Cubiertos: [number, number];  // Rango de m² cubiertos
  bedrooms: string;      // "all" o número en string
  bathrooms: string;     // "all" o número en string
  garage: string;        // "all" | "true" | "false"
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
  m2Total?: number;
  m2Cubiertos?: number;
  bedrooms?: number;
  bathrooms?: number;
  garage?: boolean;
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
  const { minPrice, maxPrice, minM2Total, maxM2Total, minM2Cubiertos, maxM2Cubiertos, locations, types } = useMemo(() => {
    const prices = items.map((i) => numberOrZero(i.price)).filter((n) => n > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 1000000;

    const m2Totals = items.map((i) => numberOrZero(i.m2Total)).filter((n) => n > 0);
    const minM2Total = m2Totals.length ? Math.min(...m2Totals) : 0;
    const maxM2Total = m2Totals.length ? Math.max(...m2Totals) : 1000;

    const m2Cubiertos = items.map((i) => numberOrZero(i.m2Cubiertos)).filter((n) => n > 0);
    const minM2Cubiertos = m2Cubiertos.length ? Math.min(...m2Cubiertos) : 0;
    const maxM2Cubiertos = m2Cubiertos.length ? Math.max(...m2Cubiertos) : 500;

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

    return { minPrice, maxPrice, minM2Total, maxM2Total, minM2Cubiertos, maxM2Cubiertos, locations: locs, types };
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
      m2Total: [minM2Total, maxM2Total],
      m2Cubiertos: [minM2Cubiertos, maxM2Cubiertos],
      bedrooms: "all",
      bathrooms: "all",
      garage: "all",
    });

  const showReset =
    value.q ||
    value.sort !== "recent" ||
    value.plan !== "all" ||
    value.location !== "all" ||
    value.type !== "all" ||
    value.rooms !== "all" ||
    value.bedrooms !== "all" ||
    value.bathrooms !== "all" ||
    value.garage !== "all" ||
    value.price[0] !== minPrice ||
    value.price[1] !== maxPrice ||
    value.m2Total[0] !== minM2Total ||
    value.m2Total[1] !== maxM2Total ||
    value.m2Cubiertos[0] !== minM2Cubiertos ||
    value.m2Cubiertos[1] !== maxM2Cubiertos;

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
          <MenuItem value="m2_desc">M²: mayor a menor</MenuItem>
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
                {n}+
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
            <span>${Intl.NumberFormat("es-AR").format(value.price[0])}</span>
            <span>${Intl.NumberFormat("es-AR").format(value.price[1])}</span>
          </Box>
        </Box>
      </Box>

      {/* FILTROS AVANZADOS (fila 3) */}
      <Box
        sx={{
          gridColumn: "1 / -1",
          display: "grid",
          gap: 1,
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(5, 1fr)",
          },
          alignItems: "center",
          mt: 1,
        }}
      >
        {/* Dormitorios */}
        <FormControl size="small" fullWidth>
          <InputLabel id="bedrooms-label">Dormitorios</InputLabel>
          <Select
            labelId="bedrooms-label"
            label="Dormitorios"
            value={value.bedrooms}
            onChange={(e) => set("bedrooms", e.target.value)}
          >
            <MenuItem value="all">Todos</MenuItem>
            {[1, 2, 3, 4, 5].map((n) => (
              <MenuItem key={n} value={String(n)}>
                {n}+
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Baños */}
        <FormControl size="small" fullWidth>
          <InputLabel id="bathrooms-label">Baños</InputLabel>
          <Select
            labelId="bathrooms-label"
            label="Baños"
            value={value.bathrooms}
            onChange={(e) => set("bathrooms", e.target.value)}
          >
            <MenuItem value="all">Todos</MenuItem>
            {[1, 2, 3, 4].map((n) => (
              <MenuItem key={n} value={String(n)}>
                {n}+
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Cochera */}
        <FormControl size="small" fullWidth>
          <InputLabel id="garage-label">Cochera</InputLabel>
          <Select
            labelId="garage-label"
            label="Cochera"
            value={value.garage}
            onChange={(e) => set("garage", e.target.value)}
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="true">Con cochera</MenuItem>
            <MenuItem value="false">Sin cochera</MenuItem>
          </Select>
        </FormControl>

        {/* M² Totales */}
        <Box sx={{ px: 1 }}>
          <Box sx={{ fontSize: 12, opacity: 0.75, mb: 0.5 }}>
            M² Totales
          </Box>
          <Slider
            value={value.m2Total}
            onChange={(_, v) => set("m2Total", v as [number, number])}
            min={minM2Total}
            max={maxM2Total}
            valueLabelDisplay="auto"
            size="small"
            sx={{ mt: 0.5 }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.75 }}>
            <span>{value.m2Total[0]}m²</span>
            <span>{value.m2Total[1]}m²</span>
          </Box>
        </Box>

        {/* M² Cubiertos */}
        <Box sx={{ px: 1 }}>
          <Box sx={{ fontSize: 12, opacity: 0.75, mb: 0.5 }}>
            M² Cubiertos
          </Box>
          <Slider
            value={value.m2Cubiertos}
            onChange={(_, v) => set("m2Cubiertos", v as [number, number])}
            min={minM2Cubiertos}
            max={maxM2Cubiertos}
            valueLabelDisplay="auto"
            size="small"
            sx={{ mt: 0.5 }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.75 }}>
            <span>{value.m2Cubiertos[0]}m²</span>
            <span>{value.m2Cubiertos[1]}m²</span>
          </Box>
        </Box>
      </Box>

      {/* CHIPS DE FILTROS ACTIVOS */}
      {showReset && (
        <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
          {value.q && (
            <Chip
              label={`Búsqueda: "${value.q}"`}
              onDelete={() => set("q", "")}
              size="small"
              color="primary"
            />
          )}
          {value.location !== "all" && (
            <Chip
              label={`Ubicación: ${value.location}`}
              onDelete={() => set("location", "all")}
              size="small"
              color="primary"
            />
          )}
          {value.type !== "all" && (
            <Chip
              label={`Tipo: ${value.type === "depto" ? "Departamento" : value.type.charAt(0).toUpperCase() + value.type.slice(1)}`}
              onDelete={() => set("type", "all")}
              size="small"
              color="primary"
            />
          )}
          {value.rooms !== "all" && (
            <Chip
              label={`Ambientes: ${value.rooms}+`}
              onDelete={() => set("rooms", "all")}
              size="small"
              color="primary"
            />
          )}
          {value.bedrooms !== "all" && (
            <Chip
              label={`Dormitorios: ${value.bedrooms}+`}
              onDelete={() => set("bedrooms", "all")}
              size="small"
              color="primary"
            />
          )}
          {value.bathrooms !== "all" && (
            <Chip
              label={`Baños: ${value.bathrooms}+`}
              onDelete={() => set("bathrooms", "all")}
              size="small"
              color="primary"
            />
          )}
          {value.garage !== "all" && (
            <Chip
              label={value.garage === "true" ? "Con cochera" : "Sin cochera"}
              onDelete={() => set("garage", "all")}
              size="small"
              color="primary"
            />
          )}
          {(value.price[0] !== minPrice || value.price[1] !== maxPrice) && (
            <Chip
              label={`Precio: $${Intl.NumberFormat("es-AR").format(value.price[0])} - $${Intl.NumberFormat("es-AR").format(value.price[1])}`}
              onDelete={() => set("price", [minPrice, maxPrice])}
              size="small"
              color="primary"
            />
          )}
          {(value.m2Total[0] !== minM2Total || value.m2Total[1] !== maxM2Total) && (
            <Chip
              label={`M² Total: ${value.m2Total[0]} - ${value.m2Total[1]}m²`}
              onDelete={() => set("m2Total", [minM2Total, maxM2Total])}
              size="small"
              color="primary"
            />
          )}
          {(value.m2Cubiertos[0] !== minM2Cubiertos || value.m2Cubiertos[1] !== maxM2Cubiertos) && (
            <Chip
              label={`M² Cubiertos: ${value.m2Cubiertos[0]} - ${value.m2Cubiertos[1]}m²`}
              onDelete={() => set("m2Cubiertos", [minM2Cubiertos, maxM2Cubiertos])}
              size="small"
              color="primary"
            />
          )}
        </Box>
      )}
    </Box>
  );
}


