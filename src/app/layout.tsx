import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ThemeRegistry from "@/components/ThemeRegistry";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: {
    default: "ITELSA Go - Plataforma Inmobiliaria",
    template: "%s | ITELSA Go",
  },
  description:
    "Encontrá tu propiedad ideal en Argentina. Miles de casas, departamentos, lotes y locales en venta y alquiler. Publicá gratis con ITELSA Go.",
  keywords: [
    "inmuebles",
    "propiedades",
    "casas",
    "departamentos",
    "alquiler",
    "venta",
    "inmobiliaria",
    "Argentina",
    "ITELSA Go",
  ],
  authors: [{ name: "ITELSA Go" }],
  creator: "ITELSA Go",
  publisher: "ITELSA Go",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://itelsago.com",
    siteName: "ITELSA Go",
    title: "ITELSA Go - Plataforma Inmobiliaria",
    description:
      "Encontrá tu propiedad ideal en Argentina. Miles de casas, departamentos, lotes y locales en venta y alquiler.",
    images: [
      {
        url: "/logo-itelsa-go.svg",
        width: 1200,
        height: 630,
        alt: "ITELSA Go",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ItelsaGo",
    creator: "@ItelsaGo",
    title: "ITELSA Go - Plataforma Inmobiliaria",
    description:
      "Encontrá tu propiedad ideal en Argentina. Miles de casas, departamentos, lotes y locales.",
    images: ["/logo-itelsa-go.svg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/favicon-180.png", sizes: "180x180", type: "image/png" }],
  },
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
          {/* 💬 Botón flotante de WhatsApp */}
          <WhatsAppButton />
        </ThemeRegistry>
      </body>
    </html>
  );
}








