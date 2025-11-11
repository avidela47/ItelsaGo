import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
  title: "ITELSA Go",
  description: "Catálogo de inmuebles",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          background: "#0b0b0f",
          color: "white",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ThemeRegistry>
          {/* 🔒 ÚNICO navbar montado */}
          <Navbar />
          <div style={{ flex: 1 }}>{children}</div>
        </ThemeRegistry>
      </body>
    </html>
  );
}








