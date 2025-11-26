"use client";

import { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import useMediaQuery from "@mui/material/useMediaQuery";
import AgencyCard from "@/components/cards/AgencyCard";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
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
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import IconButton from "@mui/material/IconButton";
import TablePagination from "@mui/material/TablePagination";

type Agency = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  plan: "free" | "pro" | "premium";
  logo?: string;
  createdAt?: string;
  status?: "active" | "paused";
};

export default function AgenciesPage() {
  const isMobile = useMediaQuery('(max-width:1024px)');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [form, setForm] = useState<any>({ name: "", email: "", phone: "", whatsapp: "", plan: "free", logo: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planEditAgency, setPlanEditAgency] = useState<Agency | null>(null);
  const [newPlan, setNewPlan] = useState<string>("");
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<string | "">("");
  const [filterStatus, setFilterStatus] = useState<string | "">("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar inmobiliarias desde la API
  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/agencies")
      .then(res => res.json())
      .then(data => {
        // Si la respuesta no es un array, intenta extraer el array o deja vacío
        if (Array.isArray(data)) {
          setAgencies(data);
        } else if (Array.isArray(data?.agencies)) {
          setAgencies(data.agencies);
        } else {
          setAgencies([]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Error al cargar inmobiliarias");
        setLoading(false);
      });
  }, []);

  // Filtrado frontend
  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch =
      agency.name.toLowerCase().includes(search.toLowerCase()) ||
      agency.email?.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan ? agency.plan === filterPlan : true;
    const matchesStatus = filterStatus ? agency.status === filterStatus : true;
    return matchesSearch && matchesPlan && matchesStatus;
  });
  const paginatedAgencies = filteredAgencies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: any) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Stubs para evitar errores de referencia
  const handleOpenPlanDialog = (agency: Agency) => {
    setPlanEditAgency(agency);
    setNewPlan(agency.plan);
    setPlanDialogOpen(true);
  };
  const handleEdit = (agency: Agency) => {
    setEditingAgency(agency);
    setForm({ ...agency });
    setOpenDialog(true);
  };
  const handleTogglePause = async (agency: Agency) => {
    const newStatus = agency.status === "paused" ? "active" : "paused";
    try {
      const res = await fetch(`/api/admin/agencies/${agency._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar estado");
      setAgencies(prev => prev.map(a => a._id === agency._id ? { ...a, status: newStatus } : a));
      setSnackbar({ open: true, message: `Inmobiliaria ${newStatus === "paused" ? "pausada" : "activada"} correctamente`, severity: "success" });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Error al actualizar estado", severity: "error" });
    }
  };
  const handleDelete = (agency: Agency) => {};
  const handleNew = () => {
    setEditingAgency(null);
    setForm({ name: "", email: "", phone: "", whatsapp: "", plan: "free", logo: "" });
    setOpenDialog(true);
  };
  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSave = async () => {
    // Validación frontend
    if (!form.name || !form.name.trim()) {
      setFormError("El nombre es obligatorio");
      return;
    }
    if (!form.email || !form.email.trim()) {
      setFormError("El email es obligatorio");
      return;
    }
    if (!isValidEmail(form.email)) {
      setFormError("El email no es válido");
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      // Aquí deberías llamar a la API para guardar (POST o PATCH)
      // ...
      setOpenDialog(false);
      setSnackbar({ open: true, message: editingAgency ? "Inmobiliaria actualizada" : "Inmobiliaria creada", severity: "success" });
    } catch (err: any) {
      setFormError(err.message || "Error al guardar inmobiliaria");
    } finally {
      setSaving(false);
    }
  };
  const handleChangePlan = () => {};
  function getPlanColor(plan: string) {
    if (plan === "premium") return "#D9A441";
    if (plan === "pro") return "#2A6EBB";
    return "#4CAF50";
  }

  return (
    <>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <BusinessIcon sx={{ fontSize: 32 }} />
        <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: 20, sm: 24 } }}>Inmobiliarias</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNew}
          sx={{ ml: { xs: 0, sm: "auto" }, width: { xs: '100%', sm: 'auto' }, mt: { xs: 2, sm: 0 } }}
        >
          Nueva Inmobiliaria
        </Button>
      </Box>
      {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>}
      {!loading && !error && (
        <Box>
          {/* Barra de búsqueda y filtros */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              alignItems: { xs: 'stretch', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: { xs: 'nowrap', sm: 'wrap' },
            }}
          >
            <TextField
              placeholder="Buscar por nombre o email"
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{ minWidth: { xs: '100%', sm: 220 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
              <InputLabel>Plan</InputLabel>
              <Select
                value={filterPlan}
                label="Plan"
                onChange={e => setFilterPlan(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="free">FREE</MenuItem>
                <MenuItem value="pro">PRO</MenuItem>
                <MenuItem value="premium">PREMIUM</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterStatus}
                label="Estado"
                onChange={e => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="active">Activa</MenuItem>
                <MenuItem value="paused">Pausada</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {filteredAgencies.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: '#888', fontSize: 18 }}>
              <BusinessIcon sx={{ fontSize: 60, opacity: 0.15, mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No hay inmobiliarias que coincidan con tu búsqueda
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Prueba ajustando los filtros o la búsqueda.
              </Typography>
            </Box>
          ) : (
            <>
              {isMobile ? (
                <Box>
                  {paginatedAgencies.map((agency) => (
                    <AgencyCard
                      key={agency._id}
                      agency={agency}
                      onEdit={() => handleEdit(agency)}
                      onDelete={() => handleDelete(agency)}
                      onTogglePause={() => handleTogglePause(agency)}
                      onChangePlan={() => handleOpenPlanDialog(agency)}
                    />
                  ))}
                </Box>
              ) : (
                <>
                  <Box sx={{
                    overflowX: "auto",
                    borderRadius: 4,
                    boxShadow: 3,
                    bgcolor: '#f7fafd',
                    p: { xs: 0.5, sm: 1 },
                    WebkitOverflowScrolling: 'touch',
                    maxWidth: '100vw',
                  }}>
                    <Table sx={{
                      minWidth: 900,
                      borderRadius: 4,
                      overflow: 'hidden',
                      fontSize: { xs: 13, sm: 15 },
                    }}>
                      <TableHead>
                        <TableRow sx={{ boxShadow: 1, bgcolor: '#f5f6fa', position: 'sticky', top: 0, zIndex: 1 }}>
                          <TableCell sx={{ minWidth: 80, color: '#222', fontWeight: 700, fontSize: { xs: 13, sm: 15 }, borderTopLeftRadius: 12 }}>Logo</TableCell>
                          <TableCell sx={{ minWidth: 150, color: '#222', fontWeight: 700, fontSize: { xs: 13, sm: 15 } }}>Nombre</TableCell>
                          <TableCell sx={{ minWidth: 200, color: '#222', fontWeight: 700, fontSize: { xs: 13, sm: 15 } }}>Email</TableCell>
                          <TableCell sx={{ minWidth: 130, color: '#222', fontWeight: 700, fontSize: { xs: 13, sm: 15 } }}>Teléfono</TableCell>
                          <TableCell sx={{ minWidth: 130, color: '#222', fontWeight: 700, fontSize: { xs: 13, sm: 15 } }}>WhatsApp</TableCell>
                          <TableCell sx={{ minWidth: 100, color: '#222', fontWeight: 700, fontSize: { xs: 13, sm: 15 } }}>Plan</TableCell>
                          <TableCell align="right" sx={{ minWidth: 140, color: '#222', fontWeight: 700, fontSize: { xs: 13, sm: 15 }, borderTopRightRadius: 12 }}>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedAgencies.map((agency, idx) => (
                          <TableRow
                            key={agency._id}
                            sx={{
                              bgcolor: agency.status === 'paused'
                                ? '#ffeaea'
                                : idx % 2 === 0
                                  ? '#fcfcfc'
                                  : '#f3f6fa',
                              transition: 'background 0.2s',
                              '&:hover': { bgcolor: agency.status === 'paused' ? '#ffd6d6' : '#e3f2fd' },
                            }}
                          >
                            <TableCell sx={{ color: '#222', py: { xs: 1, sm: 2 } }}>
                              {agency.logo ? (
                                <img
                                  src={agency.logo}
                                  alt={agency.name}
                                  style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8, background: '#fff', border: '1px solid #eee', boxShadow: '0 1px 4px #0001' }}
                                />
                              ) : (
                                <BusinessIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                              )}
                            </TableCell>
                            <TableCell sx={{ color: '#222', fontWeight: 500, maxWidth: { xs: 120, sm: 'none' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agency.name}</TableCell>
                            <TableCell sx={{ color: '#222', maxWidth: { xs: 120, sm: 'none' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agency.email || "-"}</TableCell>
                            <TableCell sx={{ color: '#222', maxWidth: { xs: 90, sm: 'none' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agency.phone || "-"}</TableCell>
                            <TableCell sx={{ color: '#222', maxWidth: { xs: 90, sm: 'none' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agency.whatsapp || "-"}</TableCell>
                            <TableCell>
                              <Chip
                                label={agency.plan?.toUpperCase() || "FREE"}
                                size="small"
                                onClick={() => handleOpenPlanDialog(agency)}
                                sx={{
                                  bgcolor: getPlanColor(agency.plan || "free"),
                                  color: "#fff",
                                  fontWeight: 700,
                                  fontSize: 13,
                                  px: 1.5,
                                  cursor: "pointer",
                                  borderRadius: 2,
                                  letterSpacing: 1,
                                  boxShadow: '0 1px 4px #0001',
                                  '&:hover': {
                                    opacity: 0.8,
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 }, justifyContent: "flex-end", alignItems: 'center' }}>
                                <Chip
                                  label={agency.status === 'paused' ? 'PAUSADA' : 'ACTIVA'}
                                  size="small"
                                  sx={{
                                    bgcolor: agency.status === 'paused' ? '#ffcdd2' : '#e8f5e9',
                                    color: agency.status === 'paused' ? '#b71c1c' : '#388e3c',
                                    fontWeight: 700,
                                    fontSize: 12,
                                    px: 1.2,
                                    borderRadius: 2,
                                    mr: 1
                                  }}
                                />
                                <Tooltip title="Editar" arrow>
                                  <IconButton aria-label="Editar" size="small" onClick={() => handleEdit(agency)} sx={{ color: '#1976d2', bgcolor: '#e3f0fd', '&:hover': { bgcolor: '#bbdefb' } }}>
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={agency.status === "paused" ? "Reanudar" : "Pausar"} arrow>
                                  <IconButton
                                    aria-label={agency.status === "paused" ? "Reanudar" : "Pausar"}
                                    size="small"
                                    onClick={() => handleTogglePause(agency)}
                                    sx={{
                                      color: agency.status === 'paused' ? '#388e3c' : '#fbc02d',
                                      bgcolor: agency.status === 'paused' ? '#e8f5e9' : '#fffde7',
                                      '&:hover': { bgcolor: agency.status === 'paused' ? '#c8e6c9' : '#fff9c4' }
                                    }}
                                  >
                                    {agency.status === "paused" ? <PlayArrowIcon /> : <PauseIcon />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar" arrow>
                                  <IconButton aria-label="Eliminar" size="small" onClick={() => handleDelete(agency)} sx={{ color: '#d32f2f', bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}>
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                  <TablePagination
                    component="div"
                    count={filteredAgencies.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Filas por página"
                    sx={{ bgcolor: '#f7fafd', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}
                  />
                </>
              )}
            </>
          )}
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

      {/* Modal de cambio rápido de plan */}
      <Dialog open={planDialogOpen} onClose={() => setPlanDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cambiar Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Inmobiliaria: <strong>{planEditAgency?.name}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Nuevo Plan</InputLabel>
            <Select
              value={newPlan}
              label="Nuevo Plan"
              onChange={(e) => setNewPlan(e.target.value as any)}
            >
              <MenuItem value="free">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#4CAF50" }} />
                  FREE - $0/mes
                </Box>
              </MenuItem>
              <MenuItem value="pro">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#2A6EBB" }} />
                  PRO - $100/mes
                </Box>
              </MenuItem>
              <MenuItem value="premium">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#D9A441" }} />
                  PREMIUM - $500/mes
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleChangePlan}>
            Cambiar Plan
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}