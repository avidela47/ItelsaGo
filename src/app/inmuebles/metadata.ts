import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inmuebles en venta y alquiler | ITELSA Go",
  description: "Buscá y encontrá inmuebles en venta y alquiler en ITELSA Go. Filtros avanzados, fotos, precios y contacto directo con agencias.",
  openGraph: {
    title: "Inmuebles en venta y alquiler | ITELSA Go",
    description: "Buscá y encontrá inmuebles en venta y alquiler en ITELSA Go. Filtros avanzados, fotos, precios y contacto directo con agencias.",
    url: "https://itelsa-go.com/inmuebles",
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
    title: "Inmuebles en venta y alquiler | ITELSA Go",
    description: "Buscá y encontrá inmuebles en venta y alquiler en ITELSA Go. Filtros avanzados, fotos, precios y contacto directo con agencias.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};