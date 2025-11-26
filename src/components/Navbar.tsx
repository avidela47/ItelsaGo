"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = () => {
      // Leer solo de localStorage para el estado de login
      const r = window.localStorage.getItem("role");
      setRole(r);
    };
    checkRole();
    window.addEventListener("storage", checkRole);
    window.addEventListener("role-changed", checkRole);
    return () => {
      window.removeEventListener("storage", checkRole);
      window.removeEventListener("role-changed", checkRole);
    };
  }, []);

  // Función de logout que elimina cookies y localStorage
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
    localStorage.clear();
    window.location.href = "/inmuebles";
  };

  // BOTÓN VERDE ITELSA
  const baseBtn: React.CSSProperties = {
    background: "linear-gradient(90deg,#25d366 0%,#128c7e 100%)",
    border: "1px solid #25d366",
    color: "#fff",
    padding: "7px 22px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
    textDecoration: "none",
    cursor: "pointer",
    boxShadow: "0 2px 12px 0 rgba(37,211,102,.10)",
    transition: "background .18s, box-shadow .18s, transform .12s",
  };

  const hoverBtn: React.CSSProperties = {
    background: "linear-gradient(90deg,#128c7e 0%,#25d366 100%)",
    transform: "translateY(-2px) scale(1.03)",
    boxShadow: "0 4px 24px 0 rgba(37,211,102,.18)",
  };

  return (
    <header
      style={{
        width: "100%",
        padding: "12px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "transparent",
      }}
    >
      {/* LOGO */}
      <Link href="/inmuebles" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Image
          src="/logo-itelsa-go.svg"
          alt="Logo ITELSA Go, plataforma inmobiliaria"
          width={140}
          height={40}
          priority
        />
      </Link>

      {/* ROLES */}
      <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>

        {!role && (
          <Link
            href="/login"
            style={baseBtn}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverBtn)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, baseBtn)}
          >
            Ingresar
          </Link>
        )}

        {role === "user" && (
          <>
            <Link
              href="/favoritos"
              style={baseBtn}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverBtn)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, baseBtn)}
            >
              ❤️ Favoritos
            </Link>

            <button
              onClick={handleLogout}
              style={baseBtn}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverBtn)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, baseBtn)}
            >
              Salir
            </button>
          </>
        )}

        {role === "agency" && (
          <>
            <Link
              href="/panel/agencia"
              style={baseBtn}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, hoverBtn)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, baseBtn)
              }
            >
              Panel
            </Link>

            <Link
              href="/publicar"
              style={baseBtn}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, hoverBtn)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, baseBtn)
              }
            >
              Publicar
            </Link>

            <button
              onClick={handleLogout}
              style={baseBtn}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverBtn)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, baseBtn)}
            >
              Salir
            </button>
          </>
        )}

        {role === "admin" && (
          <>
            <Link
              href="/publicar"
              style={baseBtn}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, hoverBtn)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, baseBtn)
              }
            >
              Publicar
            </Link>

            <Link
              href="/panel"
              style={baseBtn}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, hoverBtn)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, baseBtn)
              }
            >
              Panel
            </Link>

            <button
              onClick={handleLogout}
              style={baseBtn}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverBtn)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, baseBtn)}
            >
              Salir
            </button>
          </>
        )}
      </nav>
    </header>
  );
}







