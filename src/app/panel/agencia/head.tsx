// Metadatos SEO y structured data para /panel/agencia
export default function Head() {
  return (
    <>
      <title>Panel de Agencia | ITELSA Go</title>
      <meta name="description" content="Gestioná tu agencia inmobiliaria, propiedades y plan en ITELSA Go. Accedé a estadísticas, publicaciones y herramientas exclusivas para agencias." />
      {/* Open Graph */}
      <meta property="og:title" content="Panel de Agencia | ITELSA Go" />
      <meta property="og:description" content="Gestioná tu agencia inmobiliaria, propiedades y plan en ITELSA Go. Accedé a estadísticas, publicaciones y herramientas exclusivas para agencias." />
      <meta property="og:url" content="https://itelsa-go.com/panel/agencia" />
      <meta property="og:site_name" content="ITELSA Go" />
      <meta property="og:image" content="/logo-itelsa-go.svg" />
      <meta property="og:locale" content="es_AR" />
      <meta property="og:type" content="website" />
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Panel de Agencia | ITELSA Go" />
      <meta name="twitter:description" content="Gestioná tu agencia inmobiliaria, propiedades y plan en ITELSA Go. Accedé a estadísticas, publicaciones y herramientas exclusivas para agencias." />
      <meta name="twitter:image" content="/logo-itelsa-go.svg" />
      <meta name="twitter:site" content="@ItelsaGo" />
      {/* Structured data Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ITELSA Go Agencia",
            "url": "https://itelsa-go.com/panel/agencia",
            "logo": "/logo-itelsa-go.svg",
            "description": "Panel de gestión para agencias inmobiliarias en ITELSA Go."
          })
        }}
      />
    </>
  );
}
