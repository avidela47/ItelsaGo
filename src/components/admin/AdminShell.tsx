"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/check", { cache: "no-store" });
        setOk(res.ok);
        if (!res.ok) router.replace("/"); // si no es admin, afuera
      } catch {
        setOk(false);
        router.replace("/");
      }
    })();
  }, [router]);

  if (ok === null) return null; // splash simple

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Box sx={{ p: 2, borderRight: "1px solid rgba(255,255,255,.08)", bgcolor: "rgba(255,255,255,.02)" }}>
        <Typography sx={{ fontWeight: 800, mb: 2 }}>Panel ITELSA Go</Typography>
        <nav style={{ display: "grid", gap: 8 }}>
          <Link href="/panel">
            <Button fullWidth variant={pathname === "/panel" ? "contained" : "outlined"}>Resumen</Button>
          </Link>
          <Link href="/panel/listings">
            <Button fullWidth variant={pathname?.startsWith("/panel/listings") ? "contained" : "outlined"}>
              Inmuebles
            </Button>
          </Link>
        </nav>
        <Divider sx={{ my: 2 }} />
        <div style={{ fontSize: 12, opacity: .7 }}>
          Logueo simple por cookie <code>role=admin</code>. (Luego migramos a JWT/NextAuth)
        </div>
      </Box>

      {/* Main */}
      <Box>
        <AppBar position="static" color="transparent" elevation={0}
          sx={{ borderBottom: "1px solid rgba(255,255,255,.08)", backdropFilter: "blur(6px)" }}>
          <Toolbar sx={{ gap: 2 }}>
            <Typography sx={{ fontWeight: 800 }}>Administrador</Typography>
            <Box sx={{ ml: "auto" }}>
              <Button href="/inmuebles" variant="outlined">Ver sitio</Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 2.5 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
