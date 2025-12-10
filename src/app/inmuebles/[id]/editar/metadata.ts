import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar inmueble | ITELSA Go",
  description: "Editá los datos, fotos y características de tu propiedad publicada en ITELSA Go de forma sencilla y rápida.",
  openGraph: {
    title: "Editar inmueble | ITELSA Go",
    description: "Editá los datos, fotos y características de tu propiedad publicada en ITELSA Go de forma sencilla y rápida.",
    url: "https://itelsa-go.com/inmuebles/[id]/editar",
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
    title: "Editar inmueble | ITELSA Go",
    description: "Editá los datos, fotos y características de tu propiedad publicada en ITELSA Go de forma sencilla y rápida.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};