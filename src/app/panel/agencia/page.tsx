"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Button, Container, Alert } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useRouter } from "next/navigation";
import DashboardStats from "@/components/dashboard/DashboardStats";
import PropertiesTable from "@/components/dashboard/PropertiesTable";

type UserData = {
  email: string;
  role: "user" | "agency" | "admin";
  plan?: "free" | "pro" | "premium";
};

export default function AgencyPanelPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Verificar autenticación y rol
    fetch("/api/user/me")
      .then((res) => {
        if (!res.ok) throw new Error("No autenticado");
        return res.json();
      })
      .then((data) => {
        if (data.role !== "agency") {
          setError("Solo usuarios con rol de agencia pueden acceder al panel");
          setTimeout(() => router.push("/"), 2000);
          return;
        }
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Debes iniciar sesión como agencia");
        setTimeout(() => router.push("/"), 2000);
      });
  }, [router]);

  if (loading || error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #061016 0%, #0a1a24 50%, #0d2433 100%)",
        color: "#e9edf2",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #00d0ff, #00ffe1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Panel de Control
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Gestiona tus propiedades y estadísticas
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddRoundedIcon />}
            onClick={() => router.push("/publicar")}
            sx={{
              background: "linear-gradient(135deg, #00d0ff, #00ffe1)",
              color: "#061016",
              fontWeight: 700,
              px: 4,
              "&:hover": {
                background: "linear-gradient(135deg, #00b8e6, #00e6ca)",
              },
            }}
          >
            Publicar Propiedad
          </Button>
        </Box>

        {/* Plan Badge */}
        {user?.plan && (
          <Box
            sx={{
              display: "inline-block",
              px: 3,
              py: 1,
              mb: 3,
              borderRadius: 3,
              background:
                user.plan === "premium"
                  ? "linear-gradient(135deg, #D9A441, #C89331)"
                  : user.plan === "pro"
                  ? "linear-gradient(135deg, #2A6EBB, #1F5AAA)"
                  : "linear-gradient(135deg, #4CAF50, #3D9840)",
              fontWeight: 700,
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Plan {user.plan}
          </Box>
        )}

        {/* Estadísticas */}
        <DashboardStats plan={user?.plan || "free"} />

        {/* Tabla de Propiedades */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: "#e9edf2",
            }}
          >
            Mis Propiedades
          </Typography>
          <PropertiesTable />
        </Box>
      </Container>
    </Box>
  );
}
