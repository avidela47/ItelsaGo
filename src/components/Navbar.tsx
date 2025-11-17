"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = () => {
      // Primero intentar leer de localStorage
      let r = window.localStorage.getItem("role");
      
      // Si no hay en localStorage, intentar leer de cookies
      if (!r) {
        const cookieRole = document.cookie.match(/(?:^|;)\s*role=([^;]+)/)?.[1];
        if (cookieRole) {
          r = cookieRole;
          // Sincronizar con localStorage
          localStorage.setItem("role", cookieRole);
        }
      }
      
      setRole(r);
    };
    
    checkRole();
    
    // Escuchar cambios en localStorage
    window.addEventListener("storage", checkRole);
    
    return () => {
      window.removeEventListener("storage", checkRole);
    };
  }, []);

  // BOTÓN VERDE ITELSA
  const baseBtn: React.CSSProperties = {
    background: "linear-gradient(135deg,rgba(0,208,255,.25),rgba(0,255,225,.18))",
    border: "1px solid rgba(0,208,255,.45)",
    color: "#e9eef5",
    padding: "6px 16px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 13,
    textDecoration: "none",
    cursor: "pointer",
    boxShadow: "0 0 6px rgba(0,0,0,0.35)",
    transition: "background .15s ease, transform .15s ease",
  };

  const hoverBtn: React.CSSProperties = {
    background: "linear-gradient(135deg,rgba(0,208,255,.35),rgba(0,255,225,.28))",
    transform: "translateY(-1px)",
    boxShadow: "0 0 10px rgba(0,0,0,0.55)",
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
          alt="ITELSA GO"
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
              onClick={() => {
                localStorage.clear();
                window.location.href = "/inmuebles";
              }}
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
              onClick={() => {
                localStorage.clear();
                window.location.href = "/inmuebles";
              }}
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
              onClick={() => {
                localStorage.clear();
                window.location.href = "/inmuebles";
              }}
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







