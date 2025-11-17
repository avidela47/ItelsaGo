"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
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
  value: { lat: number; lng: number } | null;
  onChange: (location: { lat: number; lng: number } | null) => void;
  height?: number;
};

// Componente interno que maneja los clicks en el mapa
function LocationMarker({ position, onLocationSelect, address }: {
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
  address?: string;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? (
    <Marker position={position}>
      {address && (
        <Popup>
          <Box sx={{ minWidth: 150 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {address}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </Typography>
          </Box>
        </Popup>
      )}
    </Marker>
  ) : null;
}

export default function MapPicker({ value, onChange, height = 400 }: Props) {
  const [mounted, setMounted] = useState(false);
  
  // Centro por defecto: Córdoba, Argentina
  const defaultCenter: LatLngExpression = [-31.4201, -64.1888];
  const currentPosition: [number, number] | null = value ? [value.lat, value.lng] : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocationSelect = (lat: number, lng: number) => {
    onChange({ lat, lng });
  };

  const handleClear = () => {
    onChange(null);
  };

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
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        📍 Ubicación en el mapa
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
        Hacé clic en el mapa para marcar la ubicación exacta de la propiedad. Escribí la dirección en el campo "Ubicación" arriba.
      </Typography>

      <Box sx={{ height, borderRadius: 2, overflow: "hidden", border: "2px solid #ddd", mb: 1 }}>
        <MapContainer
          center={currentPosition || defaultCenter}
          zoom={currentPosition ? 15 : 13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={currentPosition} 
            onLocationSelect={handleLocationSelect}
          />
        </MapContainer>
      </Box>

      {value && (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="caption" color="text.secondary">
            📌 Coordenadas: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </Typography>
          <Button size="small" variant="outlined" color="error" onClick={handleClear}>
            Limpiar ubicación
          </Button>
        </Box>
      )}
    </Box>
  );
}
