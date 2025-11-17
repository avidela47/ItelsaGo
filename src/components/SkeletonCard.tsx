import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export default function SkeletonCard() {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,.08)",
        background: "rgba(255,255,255,.03)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Imagen skeleton */}
      <Skeleton
        variant="rectangular"
        animation="wave"
        sx={{
          width: "100%",
          aspectRatio: "16/10",
          bgcolor: "rgba(255,255,255,.08)",
        }}
      />

      {/* Body skeleton */}
      <Box sx={{ p: 1.8, display: "flex", flexDirection: "column", gap: 1 }}>
        {/* Precio */}
        <Skeleton
          variant="text"
          animation="wave"
          sx={{
            width: "50%",
            height: 28,
            bgcolor: "rgba(255,255,255,.08)",
          }}
        />

        {/* Título (2 líneas) */}
        <Skeleton
          variant="text"
          animation="wave"
          sx={{
            width: "100%",
            height: 20,
            bgcolor: "rgba(255,255,255,.06)",
          }}
        />
        <Skeleton
          variant="text"
          animation="wave"
          sx={{
            width: "80%",
            height: 20,
            bgcolor: "rgba(255,255,255,.06)",
          }}
        />

        {/* Ubicación */}
        <Skeleton
          variant="text"
          animation="wave"
          sx={{
            width: "60%",
            height: 18,
            bgcolor: "rgba(255,255,255,.06)",
            mt: 0.5,
          }}
        />

        {/* Características (chips) */}
        <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{
              width: 60,
              height: 24,
              bgcolor: "rgba(255,255,255,.06)",
            }}
          />
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{
              width: 60,
              height: 24,
              bgcolor: "rgba(255,255,255,.06)",
            }}
          />
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{
              width: 60,
              height: 24,
              bgcolor: "rgba(255,255,255,.06)",
            }}
          />
        </Box>

        {/* Botón WhatsApp */}
        <Skeleton
          variant="rounded"
          animation="wave"
          sx={{
            width: "100%",
            height: 36,
            bgcolor: "rgba(255,255,255,.08)",
            mt: 1,
          }}
        />
      </Box>
    </Box>
  );
}
