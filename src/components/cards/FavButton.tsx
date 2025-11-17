"use client";

import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CircularProgress from "@mui/material/CircularProgress";

export default function FavButton({ id }: { id: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verificar si está logueado usando la cookie "role" que NO es httpOnly
    const role = document.cookie.match(/(?:^|;)\s*role=([^;]+)/)?.[1];
    const isLogged = !!role && role !== "guest";
    console.log("FavButton - role:", role, "isLogged:", isLogged);
    setIsLoggedIn(isLogged);
    
    if (!isLogged) return;

    // Cargar estado inicial de favoritos
    checkIfFavorite();
  }, [id]);

  async function checkIfFavorite() {
    try {
      const res = await fetch("/api/user/favorites");
      if (!res.ok) return;
      
      const data = await res.json();
      const favorites = data.favorites || [];
      setIsFavorite(favorites.some((fav: any) => fav._id === id));
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  }

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Verificar login usando "role" que SÍ es accesible desde JS
    const role = document.cookie.match(/(?:^|;)\s*role=([^;]+)/)?.[1];
    console.log("Click en favorito - role:", role, "isLoggedIn state:", isLoggedIn);
    
    if (!role || role === "guest") {
      console.log("No logueado o guest, redirigiendo a login");
      // Redirigir al login si no está logueado
      window.location.href = "/login?from=inmuebles";
      return;
    }

    setLoading(true);

    try {
      const endpoint = isFavorite ? "/api/user/favorites/remove" : "/api/user/favorites/add";
      const method = isFavorite ? "DELETE" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar favorito");
      }

      setIsFavorite(!isFavorite);
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      alert(error.message || "Error al actualizar favorito");
    } finally {
      setLoading(false);
    }
  }

  // Ahora el botón SIEMPRE se muestra, redirige a login si no está autenticado
  return (
    <IconButton
      onClick={toggleFavorite}
      disabled={loading}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      sx={{
        width: 40,
        height: 40,
        bgcolor: "rgba(255,255,255,.9)",
        "&:hover": {
          bgcolor: "rgba(255,255,255,1)",
        },
      }}
    >
      {loading ? (
        <CircularProgress size={20} />
      ) : isFavorite ? (
        <FavoriteIcon sx={{ color: "#ff0050" }} />
      ) : (
        <FavoriteBorderIcon sx={{ color: "#000" }} />
      )}
    </IconButton>
  );
}
