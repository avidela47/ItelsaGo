import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión | ITELSA Go",
  description: "Accedé a tu cuenta de ITELSA Go para gestionar tus inmuebles, favoritos y alertas personalizadas.",
  openGraph: {
    title: "Iniciar sesión | ITELSA Go",
    description: "Accedé a tu cuenta de ITELSA Go para gestionar tus inmuebles, favoritos y alertas personalizadas.",
    url: "https://itelsa-go.com/login",
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
    title: "Iniciar sesión | ITELSA Go",
    description: "Accedé a tu cuenta de ITELSA Go para gestionar tus inmuebles, favoritos y alertas personalizadas.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};