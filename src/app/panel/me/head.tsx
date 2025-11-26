// Metadatos SEO y structured data para /panel/me (perfil de usuario)
export default function Head() {
  return (
    <>
      <title>Mi Perfil | ITELSA Go</title>
      <meta name="description" content="Gestioná tu perfil, datos personales y alertas en ITELSA Go. Accedé a tus favoritos, alertas y configuración de usuario." />
      {/* Open Graph */}
      <meta property="og:title" content="Mi Perfil | ITELSA Go" />
      <meta property="og:description" content="Gestioná tu perfil, datos personales y alertas en ITELSA Go. Accedé a tus favoritos, alertas y configuración de usuario." />
      <meta property="og:url" content="https://itelsa-go.com/panel/me" />
      <meta property="og:site_name" content="ITELSA Go" />
      <meta property="og:image" content="/logo-itelsa-go.svg" />
      <meta property="og:locale" content="es_AR" />
      <meta property="og:type" content="profile" />
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Mi Perfil | ITELSA Go" />
      <meta name="twitter:description" content="Gestioná tu perfil, datos personales y alertas en ITELSA Go. Accedé a tus favoritos, alertas y configuración de usuario." />
      <meta name="twitter:image" content="/logo-itelsa-go.svg" />
      <meta name="twitter:site" content="@ItelsaGo" />
      {/* Structured data Person */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Usuario ITELSA Go",
            "url": "https://itelsa-go.com/panel/me",
            "image": "/logo-itelsa-go.svg",
            "description": "Perfil de usuario en ITELSA Go. Favoritos, alertas y configuración personal."
          })
        }}
      />
    </>
  );
}
