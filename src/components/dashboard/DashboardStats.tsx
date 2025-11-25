"use client";

import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, LinearProgress, Skeleton } from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import VisibilityIcon from "@mui/icons-material/Visibility";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmailIcon from "@mui/icons-material/Email";

type Plan = "free" | "pro" | "premium";

type StatsData = {
  totalProperties: number;
  totalViews: number;
  featuredProperties: number;
  totalContacts: number;
  pendingContacts: number;
  limit: number;
  percentage: number;
};

const PLAN_LIMITS = {
  free: 5,
  pro: 25,
  premium: 50,
};

const PLAN_COLORS = {
  free: {
    bg: "linear-gradient(135deg, #4CAF5015, #A9E5B010)",
    border: "#4CAF50",
    hover: "rgba(76, 175, 80, 0.2)",
  },
  pro: {
    bg: "linear-gradient(135deg, #2A6EBB15, #70A6FF10)",
    border: "#2A6EBB",
    hover: "rgba(42, 110, 187, 0.2)",
  },
  premium: {
    bg: "linear-gradient(135deg, #D9A44115, #F5C85010)",
    border: "#D9A441",
    hover: "rgba(217, 164, 65, 0.2)",
  },
};

type Props = {
  plan: Plan;
};

export default function DashboardStats({ plan }: Props) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agency/stats")
      .then((res) => res.json())
      .then((data) => {
        const limit = PLAN_LIMITS[plan];
        const percentage = Math.min((data.totalProperties / limit) * 100, 100);
        setStats({
          ...data,
          limit,
          percentage,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading stats:", err);
        setLoading(false);
      });
  }, [plan]);

  if (loading) {
    return (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
        ))}
      </Box>
    );
  }

  if (!stats) return null;

  const planStyle = PLAN_COLORS[plan];
  const isNearLimit = stats.percentage >= 80;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 3 }}>
      {/* Total Propiedades */}
      <Card
        sx={{
          background: planStyle.bg,
          border: `1px solid ${planStyle.border}`,
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: `0 8px 16px ${planStyle.hover}`,
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <HomeWorkIcon sx={{ fontSize: 28, color: planStyle.border }} />
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 600 }}>
              Propiedades Publicadas
            </Typography>
          </Box>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{ color: planStyle.border, mb: 1 }}
          >
            {stats.totalProperties}
            <Typography
              component="span"
              variant="h6"
              sx={{ color: "rgba(255,255,255,0.6)", ml: 1 }}
            >
              / {stats.limit}
            </Typography>
          </Typography>
          <LinearProgress
            variant="determinate"
            value={stats.percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "rgba(255,255,255,0.1)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: isNearLimit ? "#ff9800" : planStyle.border,
                borderRadius: 4,
              },
            }}
          />
          <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: "block" }}>
            {isNearLimit
              ? `⚠️ Cerca del límite (${Math.round(stats.percentage)}%)`
              : `${Math.round(stats.percentage)}% del límite usado`}
          </Typography>
        </CardContent>
      </Card>

      {/* Vistas Totales */}
      <Card
        sx={{
          background: "linear-gradient(135deg, rgba(0, 208, 255, 0.08), rgba(0, 255, 225, 0.05))",
          border: "1px solid rgba(0, 208, 255, 0.4)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 16px rgba(0, 208, 255, 0.2)",
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <VisibilityIcon sx={{ fontSize: 28, color: "#00d0ff" }} />
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 600 }}>
              Vistas Totales
            </Typography>
          </Box>
          <Typography variant="h3" fontWeight={900} sx={{ color: "#00d0ff" }}>
            {(typeof stats.totalViews === "number" ? stats.totalViews : 0).toLocaleString()}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: "block" }}>
            En todas tus propiedades
          </Typography>
        </CardContent>
      </Card>

      {/* Propiedades Destacadas */}
      <Card
        sx={{
          background: "linear-gradient(135deg, rgba(255, 193, 7, 0.08), rgba(255, 152, 0, 0.05))",
          border: "1px solid rgba(255, 193, 7, 0.4)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 16px rgba(255, 193, 7, 0.2)",
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <StarIcon sx={{ fontSize: 28, color: "#ffc107" }} />
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 600 }}>
              Destacadas
            </Typography>
          </Box>
          <Typography variant="h3" fontWeight={900} sx={{ color: "#ffc107" }}>
            {stats.featuredProperties}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: "block" }}>
            Propiedades en portada
          </Typography>
        </CardContent>
      </Card>

      {/* Contactos Recibidos */}
      <Card
        sx={{
          background: "linear-gradient(135deg, rgba(156, 39, 176, 0.08), rgba(186, 104, 200, 0.05))",
          border: "1px solid rgba(156, 39, 176, 0.4)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 16px rgba(156, 39, 176, 0.2)",
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <EmailIcon sx={{ fontSize: 28, color: "#9c27b0" }} />
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 600 }}>
              Contactos
            </Typography>
          </Box>
          <Typography variant="h3" fontWeight={900} sx={{ color: "#9c27b0" }}>
            {stats.totalContacts}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: "block" }}>
            {stats.pendingContacts > 0 && (
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  background: "rgba(255, 152, 0, 0.15)",
                  color: "#ff9800",
                  fontWeight: 600,
                  mr: 1,
                }}
              >
                {stats.pendingContacts} pendiente{stats.pendingContacts !== 1 ? "s" : ""}
              </Box>
            )}
            Consultas recibidas
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
