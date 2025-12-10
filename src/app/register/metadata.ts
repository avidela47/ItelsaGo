import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta | ITELSA Go",
  description: "Registrate gratis en ITELSA Go y accedé a alertas personalizadas, favoritos y gestión de inmuebles.",
  openGraph: {
    title: "Crear cuenta | ITELSA Go",
    description: "Registrate gratis en ITELSA Go y accedé a alertas personalizadas, favoritos y gestión de inmuebles.",
    url: "https://itelsa-go.com/register",
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
    title: "Crear cuenta | ITELSA Go",
    description: "Registrate gratis en ITELSA Go y accedé a alertas personalizadas, favoritos y gestión de inmuebles.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};