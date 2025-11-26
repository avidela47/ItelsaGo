// Metadatos SEO para /inmuebles (server component)
export default function Head() {
  return (
    <>
      <title>Propiedades en venta y alquiler | ITELSA Go</title>
      <meta name="description" content="Explorá el listado más completo de propiedades en venta y alquiler en Argentina. Filtrá por ubicación, precio, tipo y más. Encontrá tu próximo hogar con ITELSA Go." />
      {/* Open Graph */}
      <meta property="og:title" content="Propiedades en venta y alquiler | ITELSA Go" />
      <meta property="og:description" content="Explorá el listado más completo de propiedades en venta y alquiler en Argentina. Filtrá por ubicación, precio, tipo y más. Encontrá tu próximo hogar con ITELSA Go." />
      <meta property="og:url" content="https://itelsa-go.com/inmuebles" />
      <meta property="og:site_name" content="ITELSA Go" />
      <meta property="og:image" content="/logo-itelsa-go.svg" />
      <meta property="og:locale" content="es_AR" />
      <meta property="og:type" content="website" />
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Propiedades en venta y alquiler | ITELSA Go" />
      <meta name="twitter:description" content="Explorá el listado más completo de propiedades en venta y alquiler en Argentina. Filtrá por ubicación, precio, tipo y más. Encontrá tu próximo hogar con ITELSA Go." />
      <meta name="twitter:image" content="/logo-itelsa-go.svg" />
      <meta name="twitter:site" content="@ItelsaGo" />
    </>
  );
}
