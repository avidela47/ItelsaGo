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
  IconButton,
  Chip,
  Tooltip,
  Alert,
  Skeleton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";

type Property = {
  _id: string;
  title: string;
  location: string;
  price: number;
  currency: "ARS" | "USD";
  propertyType?: string;
  rooms?: number;
  views?: number;
  featured?: boolean;
  createdAt: string;
};

export default function PropertiesTable() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProperties = () => {
    setLoading(true);
    fetch("/api/agency/listings")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setProperties(data.listings || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar propiedades");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p._id !== id));
        setDeleteDialog(null);
      } else {
        alert(data.error || "Error al eliminar");
      }
    } catch (err) {
      alert("Error al eliminar propiedad");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) =>
            p._id === id ? { ...p, featured: !currentFeatured } : p
          )
        );
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar");
      }
    } catch (err) {
      alert("Error al actualizar propiedad");
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
          border: "1px solid rgba(255,255,255,0.1)",
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
      <TableContainer
        component={Paper}
        sx={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Propiedad</TableCell>
              <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Ubicación</TableCell>
              <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Precio</TableCell>
              <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Amb.</TableCell>
              <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Vistas</TableCell>
              <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Fecha</TableCell>
              <TableCell sx={{ color: "#e9edf2", fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.map((property) => (
              <TableRow
                key={property._id}
                sx={{
                  "&:hover": {
                    background: "rgba(255,255,255,0.05)",
                  },
                }}
              >
                <TableCell sx={{ color: "#e9edf2" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {property.featured && (
                      <StarRoundedIcon sx={{ color: "#ffc107", fontSize: 20 }} />
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {property.title}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "#e9edf2" }}>
                  <Chip
                    label={property.propertyType || "N/A"}
                    size="small"
                    sx={{
                      background: "rgba(0,208,255,0.15)",
                      color: "#00d0ff",
                      borderColor: "#00d0ff",
                    }}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell sx={{ color: "#e9edf2" }}>{property.location}</TableCell>
                <TableCell sx={{ color: "#e9edf2", fontWeight: 600 }}>
                  {property.currency === "USD" ? "US$" : "$"}
                  {property.price.toLocaleString()}
                </TableCell>
                <TableCell sx={{ color: "#e9edf2" }}>{property.rooms || "-"}</TableCell>
                <TableCell sx={{ color: "#e9edf2" }}>
                  <Chip
                    icon={<VisibilityRoundedIcon />}
                    label={property.views || 0}
                    size="small"
                    sx={{
                      background: "rgba(76,175,80,0.15)",
                      color: "#4caf50",
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: "#e9edf2" }}>
                  {new Date(property.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title={property.featured ? "Quitar destacado" : "Destacar"}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleFeatured(property._id, !!property.featured)}
                        sx={{ color: property.featured ? "#ffc107" : "rgba(255,255,255,0.5)" }}
                      >
                        {property.featured ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/inmuebles/${property._id}`)}
                        sx={{ color: "#00d0ff" }}
                      >
                        <VisibilityRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/api/listings/${property._id}/editar`)}
                        sx={{ color: "#2196f3" }}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog(property._id)}
                        sx={{ color: "#f44336" }}
                      >
                        <DeleteRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de confirmación */}
      <Dialog
        open={!!deleteDialog}
        onClose={() => !deleting && setDeleteDialog(null)}
        PaperProps={{
          sx: {
            background: "#0a1a24",
            color: "#e9edf2",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        <DialogTitle>¿Eliminar propiedad?</DialogTitle>
        <DialogContent>
          <Typography>
            Esta acción no se puede deshacer. La propiedad será eliminada permanentemente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={() => deleteDialog && handleDelete(deleteDialog)}
            disabled={deleting}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #f44336, #d32f2f)",
              "&:hover": {
                background: "linear-gradient(135deg, #d32f2f, #b71c1c)",
              },
            }}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
