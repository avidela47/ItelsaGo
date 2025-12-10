
import { Metadata } from "next";
import PanelHome from "./PanelHome";

export const metadata: Metadata = {
  title: "Panel de Administración | ITELSA Go",
  description: "Accedé al dashboard de administración de ITELSA Go. Gestioná propiedades, agencias, usuarios y estadísticas del sistema desde un solo lugar.",
  openGraph: {
    title: "Panel de Administración | ITELSA Go",
    description: "Accedé al dashboard de administración de ITELSA Go. Gestioná propiedades, agencias, usuarios y estadísticas del sistema desde un solo lugar.",
    url: "https://itelsa-go.com/panel",
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
    title: "Panel de Administración | ITELSA Go",
    description: "Accedé al dashboard de administración de ITELSA Go. Gestioná propiedades, agencias, usuarios y estadísticas del sistema desde un solo lugar.",
    images: ["/logo-itelsa-go.svg"],
    site: "@ItelsaGo"
  }
};

export default function Page() {
  return <PanelHome />;
}

