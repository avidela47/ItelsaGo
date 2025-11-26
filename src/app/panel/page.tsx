
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Panel de Administración | ITELSA Go",
  description: "Accedé al dashboard de administración de ITELSA Go. Gestioná propiedades, agencias, usuarios y estadísticas del sistema desde un solo lugar.",
  openGraph: {
    title: "Panel de Administración | ITELSA Go",
    description: "Accedé al dashboard de administración de ITELSA Go. Gestioná propiedades, agencias, usuarios y estadísticas del sistema desde un solo lugar.",
    url: "https://itelsa-go.com/panel",
    siteName: "ITELSA Go",
    images: [
      {
        url: "/logo-itelsa-go.svg",
        width: 600,
        height: 315,
        alt: "ITELSA Go logo"
      }
    ],
    locale: "es_AR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Panel de Administración | ITELSA Go",
    description: "Accedé al dashboard de administración de ITELSA Go. Gestioná propiedades, agencias, usuarios y estadísticas del sistema desde un solo lugar.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};

"use client";

import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Button from "@mui/material/Button";
import BusinessIcon from "@mui/icons-material/Business";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PeopleIcon from "@mui/icons-material/People";
import HistoryIcon from "@mui/icons-material/History";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

type Stats = {
  plans: {
    free: number;
    pro: number;
    premium: number;
    total: number;
  };
  roles: {
    user: number;
    agency: number;
    admin: number;
    total: number;
  };
  latestListings: Array<{
    _id: string;
    title: string;
    location: string;
    price: number;
    currency: string;
    plan: string;
    createdAt: string;
    agency?: {
      _id?: string;
      name?: string;
      logo?: string;
      plan?: string;
    } | null;
    propertyType?: string;
    warningAgency?: string;
  }>;
};

type FinancialStats = {
  mrr: {
    total: number;
    pro: number;
    premium: number;
  };
  arr: number;
  subscriptions: {
    pro: number;
    premium: number;
    total: number;
  };
  newThisMonth: {
    pro: number;
    premium: number;
    total: number;
  };
  trend: Array<{
    month: string;
    revenue: number;
  }>;
};

export default function PanelHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [financial, setFinancial] = useState<FinancialStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [resStats, resFinancial] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/financial-stats"),
        ]);
        
        const dataStats = await resStats.json();
        const dataFinancial = await resFinancial.json();
        
        if (!resStats.ok) throw new Error(dataStats.error || "Error al cargar estadísticas");
        if (!resFinancial.ok) throw new Error(dataFinancial.error || "Error al cargar estadísticas financieras");
        
        setStats(dataStats.stats);
        setFinancial(dataFinancial.financial);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) return null;

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <DashboardIcon sx={{ fontSize: 32 }} />
        <Typography variant="h4">Dashboard Admin</Typography>
      </Box>

      {/* Estadísticas de Propiedades por Plan */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <HomeWorkIcon sx={{ fontSize: 24, opacity: 0.8 }} />
          <Typography variant="h6">Propiedades por Plan</Typography>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2 }}>
          <Card sx={{ 
            background: "linear-gradient(135deg, #4CAF5015, #A9E5B010)", 
            border: "1px solid #4CAF50",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(76, 175, 80, 0.2)" }
          }}>
            <CardContent>
              <Typography variant="h3" fontWeight={900} sx={{ color: "#4CAF50" }}>
                {stats.plans.free}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                FREE
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: "linear-gradient(135deg, #2A6EBB15, #70A6FF10)", 
            border: "1px solid #2A6EBB",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(42, 110, 187, 0.2)" }
          }}>
            <CardContent>
              <Typography variant="h3" fontWeight={900} sx={{ color: "#2A6EBB" }}>
                {stats.plans.pro}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                PRO
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: "linear-gradient(135deg, #D9A44115, #F2DFA510)", 
            border: "1px solid #D9A441",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(217, 164, 65, 0.2)" }
          }}>
            <CardContent>
              <Typography variant="h3" fontWeight={900} sx={{ color: "#D9A441" }}>
                {stats.plans.premium}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                PREMIUM
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: "linear-gradient(135deg, rgba(255,255,255,.05), rgba(255,255,255,.02))", 
            border: "1px solid rgba(255,255,255,.12)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(255, 255, 255, 0.1)" }
          }}>
            <CardContent>
              <Typography variant="h3" fontWeight={900}>
                {stats.plans.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                TOTAL
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Acceso rápido a gestión de inmobiliarias */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          href="/panel/agencies"
          startIcon={<BusinessIcon />}
        >
          Gestionar Inmobiliarias
        </Button>
      </Box>
      {/* Estadísticas de Usuarios por Rol */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <PeopleIcon sx={{ fontSize: 24, opacity: 0.8 }} />
          <Typography variant="h6">Usuarios por Rol</Typography>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2 }}>
          <Card sx={{
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(255, 255, 255, 0.1)" }
          }}>
            <CardContent>
              <Typography variant="h3" fontWeight={900}>
                {stats.roles.user}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Usuarios
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(255, 255, 255, 0.1)" }
          }}>
            <CardContent>
              <Typography variant="h3" fontWeight={900}>
                {stats.roles.agency}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Inmobiliarias
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(255, 255, 255, 0.1)" }
          }}>
            <CardContent>
              <Typography variant="h3" fontWeight={900}>
                {stats.roles.admin}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Admins
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(255, 255, 255, 0.1)" }
          }}>
            <CardContent>
              <Typography variant="h3" fontWeight={900}>
                {stats.roles.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                TOTAL
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Estadísticas Financieras */}
      {financial && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <AttachMoneyIcon sx={{ fontSize: 24, opacity: 0.8 }} />
            <Typography variant="h6">Estadísticas Financieras</Typography>
          </Box>
          
          {/* MRR y ARR */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 2 }}>
            <Card sx={{
              background: "linear-gradient(135deg, #4CAF5015, #66BB6A10)",
              border: "1px solid #4CAF50",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(76, 175, 80, 0.2)" }
            }}>
              <CardContent>
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  MRR (Ingresos Mensuales)
                </Typography>
                <Typography variant="h3" fontWeight={900} sx={{ color: "#4CAF50" }}>
                  ${financial.mrr.total.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                  PRO: ${financial.mrr.pro.toLocaleString()} • PREMIUM: ${financial.mrr.premium.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{
              background: "linear-gradient(135deg, #2196F315, #42A5F510)",
              border: "1px solid #2196F3",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(33, 150, 243, 0.2)" }
            }}>
              <CardContent>
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  ARR (Proyección Anual)
                </Typography>
                <Typography variant="h3" fontWeight={900} sx={{ color: "#2196F3" }}>
                  ${financial.arr.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                  Basado en suscripciones activas
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{
              background: "linear-gradient(135deg, #FF980015, #FFB74D10)",
              border: "1px solid #FF9800",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(255, 152, 0, 0.2)" }
            }}>
              <CardContent>
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  Nuevas Este Mes
                </Typography>
                <Typography variant="h3" fontWeight={900} sx={{ color: "#FF9800" }}>
                  {financial.newThisMonth.total}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                  PRO: {financial.newThisMonth.pro} • PREMIUM: {financial.newThisMonth.premium}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Tendencia de ingresos */}
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 20, opacity: 0.8 }} />
              <Typography variant="subtitle1">Tendencia de Ingresos (Últimos 6 Meses)</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, height: 120 }}>
              {financial.trend.map((item, idx) => {
                const maxRevenue = Math.max(...financial.trend.map(t => t.revenue));
                const height = (item.revenue / maxRevenue) * 100;
                
                return (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: 0.6, fontSize: 10 }}>
                      ${(item.revenue / 1000).toFixed(1)}k
                    </Typography>
                    <Box
                      sx={{
                        width: "100%",
                        height: `${height}%`,
                        background: "linear-gradient(180deg, #4CAF50, #66BB6A)",
                        borderRadius: 1,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "scaleY(1.05)",
                          boxShadow: "0 4px 8px rgba(76, 175, 80, 0.3)",
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ opacity: 0.7, fontSize: 11 }}>
                      {item.month}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Box>
      )}

      {/* Últimas Propiedades */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <HistoryIcon sx={{ fontSize: 24, opacity: 0.8 }} />
          <Typography variant="h6">Últimas 10 Propiedades</Typography>
        </Box>
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Inmobiliaria</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Inmueble</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.latestListings.map((item) => (
                <TableRow key={item._id} hover>
                  {/* Inmobiliaria */}
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {item.agency?.logo ? (
                        <img src={item.agency.logo} alt="logo" style={{ width: 24, height: 24, objectFit: "contain" }} />
                      ) : (
                        <span style={{ width: 24, height: 24, display: 'inline-block', background: '#eee', borderRadius: 12 }} />
                      )}
                      <Typography variant="body2">{item.agency?.name || "Sin inmobiliaria"}</Typography>
                    </Box>
                  </TableCell>
                  {/* Plan */}
                  <TableCell>
                    {item.warningAgency ? (
                      <Chip
                        size="small"
                        label={item.agency?.plan ? item.agency.plan.toUpperCase() : "SIN PLAN"}
                        color="warning"
                        sx={{ fontWeight: 700 }}
                        title={item.warningAgency}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label={(item.agency?.plan || "FREE").toUpperCase()}
                        sx={{
                          fontWeight: 700,
                          background: item.agency?.plan === "premium" ? "#D9A441" : item.agency?.plan === "pro" ? "#2A6EBB" : "#4CAF50",
                          color: "#fff"
                        }}
                      />
                    )}
                  </TableCell>
                  {/* Inmueble */}
                  <TableCell>{item.title}</TableCell>
                  {/* Tipo */}
                  <TableCell>{item.propertyType || '-'}</TableCell>
                  {/* Precio */}
                  <TableCell>
                    {item.currency} {new Intl.NumberFormat("es-AR").format(item.price || 0)}
                  </TableCell>
                  {/* Fecha */}
                  <TableCell>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("es-AR")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Box>
    </Box>
  );
}

