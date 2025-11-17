"use client";

import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CircularProgress from "@mui/material/CircularProgress";

export default function FavButton({ id }: { id: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [id]);

  async function checkAuth() {
    try {
      const res = await fetch("/api/user/favorites");
      
      if (res.status === 401 || res.status === 403) {
        console.log("FavButton - No logueado, status:", res.status);
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        console.error("FavButton - Error verificar favoritos:", res.status);
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const favorites = data.favorites || [];
      const isFav = favorites.some((fav: any) => fav._id === id);
      setIsFavorite(isFav);
      setIsLoggedIn(true);
      console.log("FavButton - Logueado, favoritos:", favorites.length);
    } catch (error) {
      console.error("FavButton - Error auth:", error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      console.log("FavButton - Redirigiendo a login");
      window.location.href = "/login?from=inmuebles";
      return;
    }

    console.log("FavButton - Toggle, actual:", isFavorite);
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

      const newState = !isFavorite;
      setIsFavorite(newState);
      console.log("FavButton - Actualizado a:", newState);
    } catch (error: any) {
      console.error("FavButton - Error toggle:", error);
      alert(error.message || "Error al actualizar favorito");
    } finally {
      setLoading(false);
    }
  }

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
