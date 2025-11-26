import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detalle de inmueble | ITELSA Go",
  description: "Ficha completa del inmueble seleccionado en ITELSA Go: fotos, precio, ubicación, características y contacto directo.",
  openGraph: {
    title: "Detalle de inmueble | ITELSA Go",
    description: "Ficha completa del inmueble seleccionado en ITELSA Go: fotos, precio, ubicación, características y contacto directo.",
    url: "https://itelsa-go.com/inmuebles/[id]",
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
    type: "article"
  },
  twitter: {
    card: "summary_large_image",
    title: "Detalle de inmueble | ITELSA Go",
    description: "Ficha completa del inmueble seleccionado en ITELSA Go: fotos, precio, ubicación, características y contacto directo.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};