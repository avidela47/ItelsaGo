"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import "leaflet/dist/leaflet.css";

// Fix para el icono por defecto de Leaflet en Next.js
if (typeof window !== "undefined") {
  const L = require("leaflet");
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

type Props = {
  lat: number;
  lng: number;
  address?: string;
  height?: number;
  title?: string;
};

export default function MapView({ lat, lng, address, height = 300, title }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const position: LatLngExpression = [lat, lng];

  // No renderizar en SSR
  if (!mounted) {
    return (
      <Box sx={{ height, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f5f5f5", borderRadius: 2 }}>
        <Typography color="text.secondary">Cargando mapa...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          📍 {title}
        </Typography>
      )}
      
      {address && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {address}
        </Typography>
      )}

      <Box sx={{ height, borderRadius: 2, overflow: "hidden", border: "2px solid #ddd" }}>
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          dragging={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            {address && (
              <Popup>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {address}
                </Typography>
              </Popup>
            )}
          </Marker>
        </MapContainer>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        📌 Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
      </Typography>
    </Box>
  );
}
