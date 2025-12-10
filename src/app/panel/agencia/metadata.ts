import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de agencia | ITELSA Go",
  description: "Gestioná la información, propiedades y plan de tu agencia inmobiliaria en ITELSA Go desde un solo lugar.",
  openGraph: {
    title: "Panel de agencia | ITELSA Go",
    description: "Gestioná la información, propiedades y plan de tu agencia inmobiliaria en ITELSA Go desde un solo lugar.",
    url: "https://itelsa-go.com/panel/agencia",
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
    title: "Panel de agencia | ITELSA Go",
    description: "Gestioná la información, propiedades y plan de tu agencia inmobiliaria en ITELSA Go desde un solo lugar.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};