import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agencias inmobiliarias | ITELSA Go",
  description: "Listado y gestión de agencias inmobiliarias en ITELSA Go. Consultá información, planes y estado de cada agencia.",
  openGraph: {
    title: "Agencias inmobiliarias | ITELSA Go",
    description: "Listado y gestión de agencias inmobiliarias en ITELSA Go. Consultá información, planes y estado de cada agencia.",
    url: "https://itelsa-go.com/panel/agencies",
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
    title: "Agencias inmobiliarias | ITELSA Go",
    description: "Listado y gestión de agencias inmobiliarias en ITELSA Go. Consultá información, planes y estado de cada agencia.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};