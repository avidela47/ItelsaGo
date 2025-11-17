"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import PropertyCard from "@/components/cards/PropertyCard";

type Item = {
  _id: string;
  title: string;
  location: string;
  price: number;
  currency: "ARS" | "USD";
  images: string[];
  rooms?: number;
  propertyType?: string;
  agency?: { logo?: string; plan?: "premium" | "pro" | "free"; whatsapp?: string };
  createdAt?: string;
};

export default function FavoritosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verificar si está logueado
    const uid = document.cookie.match(/(?:^|;)\s*uid=([^;]+)/)?.[1];
    setIsLoggedIn(!!uid);

    if (!uid) {
      setLoading(false);
      return;
    }

    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/user/favorites");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al cargar favoritos");
      }

      setItems(data.favorites || []);
    } catch (err: any) {
      console.error("Error loading favorites:", err);
      setError(err.message || "Error al cargar favoritos");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
            Mis Favoritos
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Debés iniciar sesión para ver tus favoritos
          </Alert>
          <Button
            variant="contained"
            onClick={() => router.push("/login?from=favoritos")}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </main>
    );
  }

  if (loading) {
    return (
      <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Cargando favoritos...</Typography>
        </Box>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="outlined" onClick={loadFavorites}>
            Reintentar
          </Button>
        </Box>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h4" fontWeight={800}>
          Mis Favoritos {items.length > 0 && `(${items.length})`}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => router.push("/inmuebles")}
        >
          Ver todas las propiedades
        </Button>
      </Box>

      {items.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
            No tenés propiedades en favoritos
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            Explorá propiedades y guardá las que te gusten haciendo click en el ♥
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/inmuebles")}
          >
            Explorar propiedades
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {items.map((item) => (
            <PropertyCard key={item._id} item={item} />
          ))}
        </Box>
      )}
    </main>
  );
}
