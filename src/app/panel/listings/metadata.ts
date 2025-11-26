import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Propiedades publicadas | ITELSA Go",
  description: "Gestioná todas las propiedades publicadas en ITELSA Go desde el panel. Editá, pausá o eliminá inmuebles fácilmente.",
  openGraph: {
    title: "Propiedades publicadas | ITELSA Go",
    description: "Gestioná todas las propiedades publicadas en ITELSA Go desde el panel. Editá, pausá o eliminá inmuebles fácilmente.",
    url: "https://itelsa-go.com/panel/listings",
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
    title: "Propiedades publicadas | ITELSA Go",
    description: "Gestioná todas las propiedades publicadas en ITELSA Go desde el panel. Editá, pausá o eliminá inmuebles fácilmente.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};