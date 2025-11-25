"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Skeleton,
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Button
} from "@mui/material";

// Tipo local para reflejar la respuesta real del endpoint /api/agency/listings
type Property = {
  _id: string;
  title: string;
  location: string;
  price: number;
  currency: "ARS" | "USD";
  propertyType: "depto" | "casa" | "lote" | "local";
  rooms?: number;
  views?: number;
  featured?: boolean;
  createdAt: string;
  favorites?: number;
  contacts?: number;
  status?: "active" | "suspended";
};
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import StarIcon from "@mui/icons-material/Star";
import BarChartIcon from "@mui/icons-material/BarChart";

export default function PropertiesTable() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agencyPlan, setAgencyPlan] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({ open: false, message: "", severity: "success" });

    useEffect(() => {
      setLoading(true);
      // Cargar propiedades y plan de la agencia en paralelo
      Promise.all([
        fetch("/api/agency/listings").then((res) => res.json()),
        fetch("/api/user/agency-info").then((res) => res.json()),
      ])
        .then(([listingsData, agencyInfo]) => {
          if (listingsData.error) {
            setError(listingsData.error);
          } else {
            setProperties(listingsData.listings || []);
          }
          if (agencyInfo.plan) {
            setAgencyPlan(agencyInfo.plan);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Error al cargar propiedades");
          setLoading(false);
        });
    }, []);

    // Acción rápida: pausar/publicar

    // Acción rápida: destacar propiedad
    const handleToggleFeatured = async (property: Property) => {
      const newFeatured = !property.featured;
      try {
        const res = await fetch(`/api/listings/${property._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featured: newFeatured }),
        });
        const data = await res.json();
        if (data.ok) {
          setProperties((prev) => prev.map((p) => p._id === property._id ? { ...p, featured: newFeatured } : p));
          setSnackbar({ open: true, message: newFeatured ? "Propiedad destacada" : "Propiedad sin destacar", severity: "success" });
        } else {
          setSnackbar({ open: true, message: data.error || "Error al actualizar destacado", severity: "error" });
        }
      } catch (e) {
        setSnackbar({ open: true, message: "Error de red", severity: "error" });
      }
    };
  const handleToggleStatus = async (property: Property) => {
      const newStatus = property.status === "active" ? "suspended" : "active";
      try {
        const res = await fetch(`/api/listings/${property._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await res.json();
        if (data.ok) {
          setProperties((prev) => prev.map((p) => p._id === property._id ? { ...p, status: newStatus } : p));
          setSnackbar({ open: true, message: newStatus === "active" ? "Propiedad publicada" : "Propiedad pausada", severity: "success" });
        } else {
          setSnackbar({ open: true, message: data.error || "Error al actualizar estado", severity: "error" });
        }
      } catch (e) {
        setSnackbar({ open: true, message: "Error de red", severity: "error" });
      }
    };

    if (loading) {
      return (
        <Box>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 2 }} />
          ))}
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (properties.length === 0) {
      return (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            background: "rgba(255,255,255,0.03)",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, opacity: 0.7 }}>
            📦 No tienes propiedades publicadas
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.6 }}>
            Comienza publicando tu primera propiedad
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/publicar")}
            sx={{
              background: "linear-gradient(135deg, #00d0ff, #00ffe1)",
              color: "#061016",
              fontWeight: 700,
            }}
          >
            Publicar Propiedad
          </Button>
        </Box>
      );
    }

    return (
      <>
        <TableContainer component={Paper} sx={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Propiedad</TableCell>
                <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Ubicación</TableCell>
                <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Precio</TableCell>
                <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Amb.</TableCell>
                <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Vistas</TableCell>
                <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Favoritos</TableCell>
                <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Consultas</TableCell>
                <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property) => {
                return (
                  <TableRow
                    key={property._id}
                    sx={{
                      "&:hover": {
                        background: "rgba(255,255,255,0.05)",
                      },
                    }}
                  >
                    <TableCell sx={{ color: "#e9edf2" }}>{property.title}</TableCell>
                    <TableCell sx={{ color: "#e9edf2" }}>{property.propertyType || "N/A"}</TableCell>
                    <TableCell sx={{ color: "#e9edf2" }}>{property.location}</TableCell>
                    <TableCell sx={{ color: "#e9edf2", fontWeight: 600 }}>
                      {property.currency === "USD" ? "US$" : "$"}
                      {property.price.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: "#e9edf2" }}>{property.rooms || "-"}</TableCell>
                    <TableCell sx={{ color: "#e9edf2" }}>{property.views || 0}</TableCell>
                    <TableCell sx={{ color: "#e9edf2" }}>{property.favorites ?? 0}</TableCell>
                    <TableCell sx={{ color: "#e9edf2" }}>{property.contacts ?? 0}</TableCell>
                    <TableCell sx={{ color: "#e9edf2" }}>{new Date(property.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {/* Acciones rápidas solo para PRO/PREMIUM */}
                      {(agencyPlan === "pro" || agencyPlan === "premium") ? (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Editar">
                            <IconButton size="small" color="info" onClick={() => router.push(`/inmuebles/${property._id}/editar`)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton size="small" color="error" onClick={() => alert('Eliminar no implementado')}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={property.status === "active" ? "Pausar" : "Publicar"}>
                            <IconButton size="small" color="warning" onClick={() => handleToggleStatus(property)}>
                              {property.status === "active" ? <PauseCircleIcon /> : <PlayCircleIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={property.featured ? "Quitar destacado" : "Destacar"}>
                            <IconButton
                              size="small"
                              color={property.featured ? "warning" : "secondary"}
                              onClick={() => handleToggleFeatured(property)}
                            >
                              <StarIcon sx={property.featured ? { color: '#FFD600' } : {}} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver estadísticas">
                            <IconButton size="small" color="success" onClick={() => alert('Ver estadísticas no implementado')}>
                              <BarChartIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Solo PRO/PREMIUM</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Snackbar feedback */}
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <MuiAlert elevation={6} variant="filled" onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </>
    );
}
