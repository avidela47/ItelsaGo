import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
  title: "ITELSA Go",
  description: "Portal inmobiliario moderno",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32.png",
    apple: "/favicon-180.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ThemeRegistry>
          {/* HEADER */}
          <header
            className="header"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              borderBottom: "1px solid rgba(255,255,255,.15)",
              background: "rgba(0,0,0,.4)",
              backdropFilter: "blur(6px)",
            }}
          >
            <a href="/" className="header__logo" aria-label="ITELSA Go" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src="/logo-itelsa-go.svg"
                alt="ITELSA Go"
                style={{ height: 32, width: "auto", display: "block" }}
              />
            </a>

            <nav className="header__nav" style={{ display: "flex", gap: 20, fontSize: 15 }}>
              <a style={{ opacity: 0.9 }} href="/inmuebles">Inmuebles</a>
              <a style={{ opacity: 0.9 }} href="/publicar">Publicar</a>
              <a style={{ opacity: 0.9 }} href="/panel">Panel</a>
            </nav>
          </header>

          {/* CONTENIDO */}
          <main className="app" style={{ paddingTop: 20 }}>
            {children}
          </main>
        </ThemeRegistry>
      </body>
    </html>
  );
}







