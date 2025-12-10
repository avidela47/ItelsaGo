import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favoritos | ITELSA Go",
  description: "Tus inmuebles favoritos en ITELSA Go. Accedé rápido a las propiedades que más te interesan y gestiona tus alertas.",
  openGraph: {
    title: "Favoritos | ITELSA Go",
    description: "Tus inmuebles favoritos en ITELSA Go. Accedé rápido a las propiedades que más te interesan y gestiona tus alertas.",
    url: "https://itelsa-go.com/favoritos",
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
    title: "Favoritos | ITELSA Go",
    description: "Tus inmuebles favoritos en ITELSA Go. Accedé rápido a las propiedades que más te interesan y gestiona tus alertas.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};