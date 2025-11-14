"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";

type Agency = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  plan: "free" | "pro" | "premium";
  logo?: string;
  createdAt?: string;
};

export default function AgenciesPage() {
  const [loading, setLoading] = useState(true);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Modal
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    plan: "free" as "free" | "pro" | "premium",
    logo: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadAgencies();
  }, []);

  async function loadAgencies() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/agencies", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar");
      setAgencies(data.agencies || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleNew() {
    setEditingAgency(null);
    setForm({ name: "", email: "", phone: "", whatsapp: "", plan: "free", logo: "" });
    setFormError(null);
    setOpenDialog(true);
  }

  function handleEdit(agency: Agency) {
    setEditingAgency(agency);
    setForm({
      name: agency.name,
      email: agency.email,
      phone: agency.phone || "",
      whatsapp: agency.whatsapp || "",
      plan: agency.plan,
      logo: agency.logo || "",
    });
    setFormError(null);
    setOpenDialog(true);
  }

  async function handleSave() {
    if (!form.name || !form.email) {
      setFormError("Nombre y email son obligatorios");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const url = editingAgency
        ? `/api/admin/agencies/${editingAgency._id}`
        : "/api/admin/agencies";
      
      const method = editingAgency ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar");
      }

      setOpenDialog(false);
      loadAgencies();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(agency: Agency) {
    if (!confirm(`¿Eliminar ${agency.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/agencies/${agency._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }

      loadAgencies();
    } catch (e: any) {
      alert(e.message);
    }
  }

  function getPlanColor(plan: string) {
    if (plan === "premium") return "#D9A441";
    if (plan === "pro") return "#2A6EBB";
    return "#4CAF50";
  }

  return (
    <>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <BusinessIcon sx={{ fontSize: 32 }} />
        <Typography variant="h5" fontWeight={700}>Inmobiliarias</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNew}
          sx={{ ml: "auto" }}
        >
          Nueva Inmobiliaria
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <CircularProgress size={20} />
          <Typography>Cargando...</Typography>
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && agencies.length === 0 && (
        <Alert severity="info">
          No hay inmobiliarias registradas. Creá la primera.
        </Alert>
      )}

      {!loading && !error && agencies.length > 0 && (
        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 80 }}>Logo</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Nombre</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Email</TableCell>
                <TableCell sx={{ minWidth: 130 }}>Teléfono</TableCell>
                <TableCell sx={{ minWidth: 130 }}>WhatsApp</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Plan</TableCell>
                <TableCell align="right" sx={{ minWidth: 200 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agencies.map((agency) => (
                <TableRow key={agency._id}>
                  <TableCell>
                    {agency.logo ? (
                      <img
                        src={agency.logo}
                        alt={agency.name}
                        style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 4 }}
                      />
                    ) : (
                      <BusinessIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                    )}
                  </TableCell>
                  <TableCell>{agency.name}</TableCell>
                  <TableCell>{agency.email || "-"}</TableCell>
                  <TableCell>{agency.phone || "-"}</TableCell>
                  <TableCell>{agency.whatsapp || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={agency.plan?.toUpperCase() || "FREE"}
                      size="small"
                      sx={{
                        bgcolor: getPlanColor(agency.plan || "free"),
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(agency)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(agency)}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Dialog para crear/editar */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAgency ? "Editar Inmobiliaria" : "Nueva Inmobiliaria"}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <TextField
            label="Nombre *"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />

          <TextField
            label="Email *"
            type="email"
            fullWidth
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Teléfono"
            fullWidth
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            label="WhatsApp"
            fullWidth
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="Si está vacío, usa el teléfono"
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Plan</InputLabel>
            <Select
              value={form.plan}
              label="Plan"
              onChange={(e) => setForm({ ...form, plan: e.target.value as any })}
            >
              <MenuItem value="free">FREE ($0/mes)</MenuItem>
              <MenuItem value="pro">PRO ($100/mes)</MenuItem>
              <MenuItem value="premium">PREMIUM ($500/mes)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="URL del Logo"
            fullWidth
            value={form.logo}
            onChange={(e) => setForm({ ...form, logo: e.target.value })}
            placeholder="https://ejemplo.com/logo.png"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
