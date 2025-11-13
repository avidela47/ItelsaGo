"use client";

import { useEffect, useMemo, useState } from "react";
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
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
  agency?: { logo?: string; plan?: "premium" | "sponsor" | "pro" | "free" };
  status?: "active" | "suspended";
  createdAt?: string;
};

export default function AdminListingsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [delId, setDelId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/listings?showAll=true", { cache: "no-store" });
      const data = await res.json();
      setItems(data?.items || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(it =>
      it.title?.toLowerCase().includes(s) ||
      it.location?.toLowerCase().includes(s)
    );
  }, [items, q]);

  async function doDelete(id: string) {
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(prev => prev.filter(x => x._id !== id));
    }
  }

  async function toggleStatus(id: string) {
    try {
      const res = await fetch(`/api/listings/${id}/toggle-status`, { method: "PATCH" });
      const data = await res.json();
      
      if (res.ok) {
        // Actualizar el item en el estado
        setItems(prev => prev.map(item => 
          item._id === id ? { ...item, status: data.status } : item
        ));
      } else {
        alert(data.error || "Error al cambiar estado");
      }
    } catch (err) {
      alert("Error al cambiar estado");
    }
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h5" fontWeight={800}>Inmuebles</Typography>
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <TextField size="small" placeholder="Buscar…" value={q} onChange={e => setQ(e.target.value)} />
          <Link href="/panel/listings/new"><Button variant="contained">Nuevo</Button></Link>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}><CircularProgress /></Box>
      ) : (
        <Table size="small" sx={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(it => (
              <TableRow key={it._id} hover>
                <TableCell>{it.title}</TableCell>
                <TableCell>{it.location}</TableCell>
                <TableCell>{it.currency} {Intl.NumberFormat("es-AR").format(it.price || 0)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={(it.agency?.plan || "free").toUpperCase()}
                    color={it.agency?.plan === "premium" ? "warning" : it.agency?.plan === "sponsor" ? "info" : "default"}
                  />
                </TableCell>
                <TableCell>{it.propertyType || "-"}</TableCell>
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
                    onClick={() => toggleStatus(it._id)}
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
  );
}
