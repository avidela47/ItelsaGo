import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publicar inmueble | ITELSA Go",
  description: "Publicá tu propiedad en ITELSA Go y llegá a miles de interesados. Fácil, rápido y con visibilidad profesional.",
  openGraph: {
    title: "Publicar inmueble | ITELSA Go",
    description: "Publicá tu propiedad en ITELSA Go y llegá a miles de interesados. Fácil, rápido y con visibilidad profesional.",
    url: "https://itelsa-go.com/publicar",
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
    title: "Publicar inmueble | ITELSA Go",
    description: "Publicá tu propiedad en ITELSA Go y llegá a miles de interesados. Fácil, rápido y con visibilidad profesional.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};