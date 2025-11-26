import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alertas de inmuebles | ITELSA Go",
  description: "Gestioná tus alertas personalizadas y recibí notificaciones de nuevos inmuebles que coincidan con tus criterios en ITELSA Go.",
  openGraph: {
    title: "Alertas de inmuebles | ITELSA Go",
    description: "Gestioná tus alertas personalizadas y recibí notificaciones de nuevos inmuebles que coincidan con tus criterios en ITELSA Go.",
    url: "https://itelsa-go.com/panel/alertas",
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
    title: "Alertas de inmuebles | ITELSA Go",
    description: "Gestioná tus alertas personalizadas y recibí notificaciones de nuevos inmuebles que coincidan con tus criterios en ITELSA Go.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};