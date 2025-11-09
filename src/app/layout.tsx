import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";

export const metadata: Metadata = {
  title: "ITELSA Go",
  description: "Portal inmobiliario moderno",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32.png",
    apple: "/favicon-180.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <header className="header">
          <div className="container header__content">

            {/* LOGO */}
            <a href="/" className="header__brand">
              <Image
                src="/logo-itelsa-go.svg"
                alt="ITELSA Go"
                width={160}
                height={40}
                priority
              />
            </a>

            {/* NAV */}
            <nav className="header__nav">
              <a href="/inmuebles">Inmuebles</a>
              <a href="/publicar" style={{ marginLeft: 16 }}>Publicar</a>
            </nav>

          </div>
        </header>

        <main className="container" style={{ paddingTop: 24 }}>
          {children}
        </main>
      </body>
    </html>
  );
}



