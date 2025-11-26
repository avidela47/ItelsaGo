"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumbs from "./breadcrumbs.jsonld";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BusinessIcon from "@mui/icons-material/Business";
import StarIcon from "@mui/icons-material/Star";
import CircularProgress from "@mui/material/CircularProgress";
import ConfirmDeleteDialog from "@/components/cards/ConfirmDeleteDialog";

type Item = {
  _id: string;
  title: string;
  price: number;
  currency: "ARS" | "USD";
  location: string;
  rooms?: number;
  propertyType?: "depto" | "casa" | "lote" | "local";
  agency?: {
    _id?: string;
    name?: string;
    logo?: string;
    plan?: "premium" | "pro" | "free" | string;
  } | null;
  status?: "active" | "suspended";
  createdAt?: string;
  views?: number;
  featured?: boolean;
  favorites?: number;
  contacts?: number;
  warningAgency?: string;
};

export default function AdminListingsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [delId, setDelId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended">("all");
  const [filterPlan, setFilterPlan] = useState<"all" | "free" | "pro" | "premium">("all");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/listings-metrics", { cache: "no-store" });
      const data = await res.json();
      setItems(data?.listings || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter(it => {
      // Filtro de búsqueda
      const matchSearch = !s || 
        it.title?.toLowerCase().includes(s) ||
        it.location?.toLowerCase().includes(s) ||
        it.agency?.name?.toLowerCase().includes(s);
      // Filtro de estado
      const matchStatus = filterStatus === "all" || 
        (filterStatus === "active" && (it.status === "active" || !it.status)) ||
        (filterStatus === "suspended" && it.status === "suspended");
      // Filtro de plan
      const plan = it.agency?.plan || "free";
      const matchPlan = filterPlan === "all" || plan === filterPlan;
      return matchSearch && matchStatus && matchPlan;
    });
  }, [items, q, filterStatus, filterPlan]);

  async function doDelete(id: string) {
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(prev => prev.filter(x => x._id !== id));
    }
  }

  async function toggleStatus(id: string, currentStatus: string | undefined) {
    try {
      const newStatus = currentStatus === "active" ? "suspended" : "active";
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setItems(prev => prev.map(item =>
          item._id === id ? { ...item, status: newStatus } : item
        ));
      } else {
        alert(data.error || "Error al cambiar estado");
      }
    } catch (err) {
      alert("Error al cambiar estado");
    }
  }

  async function toggleFeatured(id: string, currentFeatured: boolean | undefined) {
    try {
      const newFeatured = !currentFeatured;
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newFeatured })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setItems(prev => prev.map(item =>
          item._id === id ? { ...item, featured: newFeatured } : item
        ));
      } else {
        alert(data.error || "Error al cambiar destacado");
      }
    } catch (err) {
      alert("Error al cambiar destacado");
    }
  }

  return (
    <>
      <Breadcrumbs />
      <Box sx={{ display: "grid", gap: 2 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" fontWeight={800}>Inmuebles</Typography>
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <Link href="/panel/listings/new"><Button variant="contained">Nuevo</Button></Link>
          </Box>
        </Box>
        {/* Estadísticas */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2 }}>
          <Box sx={{ p: 2, border: "1px solid rgba(255,255,255,.08)", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Total Propiedades</Typography>
            <Typography variant="h4" fontWeight={700}>{items.length}</Typography>
          </Box>
          <Box sx={{ p: 2, border: "1px solid rgba(255,255,255,.08)", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Activas</Typography>
            <Typography variant="h4" fontWeight={700} color="success.main">
              {items.filter(i => i.status === "active" || !i.status).length}
            </Typography>
          </Box>
          <Box sx={{ p: 2, border: "1px solid rgba(255,255,255,.08)", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Suspendidas</Typography>
            <Typography variant="h4" fontWeight={700} color="error.main">
              {items.filter(i => i.status === "suspended").length}
            </Typography>
          </Box>
          <Box sx={{ p: 2, border: "1px solid rgba(255,255,255,.08)", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Mostrando</Typography>
            <Typography variant="h4" fontWeight={700}>{filtered.length}</Typography>
          </Box>
        </Box>
        {/* Filtros */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField 
            size="small" 
            placeholder="Buscar por título, ubicación o inmobiliaria..." 
            value={q} 
            onChange={e => setQ(e.target.value)}
            sx={{ minWidth: 300 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={filterStatus} label="Estado" onChange={e => setFilterStatus(e.target.value as any)}>
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="suspended">Suspendidos</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Plan</InputLabel>
            <Select value={filterPlan} label="Plan" onChange={e => setFilterPlan(e.target.value as any)}>
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="free">FREE</MenuItem>
              <MenuItem value="pro">PRO</MenuItem>
              <MenuItem value="premium">PREMIUM</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}><CircularProgress /></Box>
        ) : (
          <Table size="small" sx={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>Inmobiliaria</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Vistas</TableCell>
                <TableCell>Favoritos</TableCell>
                <TableCell>Consultas</TableCell>
                <TableCell>Destacado</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(it => (
                <TableRow key={it._id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {it.agency?.logo ? (
                        <img src={it.agency.logo} alt="logo" style={{ width: 24, height: 24, objectFit: "contain" }} />
                      ) : (
                        <BusinessIcon sx={{ fontSize: 24, color: "text.secondary" }} />
                      )}
                      <Typography variant="body2">{it.agency?.name || "Sin inmobiliaria"}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{it.title}</TableCell>
                  <TableCell>{it.location}</TableCell>
                  <TableCell>{it.currency} {Intl.NumberFormat("es-AR").format(it.price || 0)}</TableCell>
                  <TableCell>
                    {it.warningAgency ? (
                      <Chip
                        size="small"
                        label={it.agency?.plan ? it.agency.plan.toUpperCase() : "SIN PLAN"}
                        color="warning"
                        sx={{ fontWeight: 700 }}
                        title={it.warningAgency}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label={(it.agency?.plan || "FREE").toUpperCase()}
                        sx={{
                          fontWeight: 700,
                          background: it.agency?.plan === "premium" ? "#D9A441" : 
                                     it.agency?.plan === "pro" ? "#2A6EBB" : "#4CAF50",
                          color: "#fff"
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{it.views ?? 0}</TableCell>
                  <TableCell>{it.favorites ?? 0}</TableCell>
                  <TableCell>{it.contacts ?? 0}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color={it.featured ? "warning" : "secondary"}
                      onClick={() => toggleFeatured(it._id, it.featured)}
                      title={it.featured ? "Quitar destacado" : "Destacar"}
                    >
                      <StarIcon sx={it.featured ? { color: '#FFD600' } : {}} />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={it.status === "suspended" ? "SUSPENDIDO" : "ACTIVO"}
                      color={it.status === "suspended" ? "error" : "success"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color={it.status === "suspended" ? "success" : "warning"}
                      onClick={() => toggleStatus(it._id, it.status)}
                      title={it.status === "suspended" ? "Activar" : "Suspender"}
                    >
                      {it.status === "suspended" ? <CheckCircleIcon /> : <BlockIcon />}
                    </IconButton>
                    <Link href={`/panel/listings/${it._id}`}><IconButton size="small"><EditRoundedIcon /></IconButton></Link>
                    <IconButton size="small" color="error" onClick={() => setDelId(it._id)}><DeleteRoundedIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <ConfirmDeleteDialog
          open={!!delId}
          onClose={() => setDelId(null)}
          onConfirm={async () => { if (delId) await doDelete(delId); setDelId(null); }}
          title="Eliminar publicación"
          hint='Para confirmar, escribí "ELIMINAR"'
          requireText="ELIMINAR"
        />
      </Box>
    </>
  );
}
