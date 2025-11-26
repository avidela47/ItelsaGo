// Breadcrumbs SEO (JSON-LD) para /panel/listings
export default function Breadcrumbs() {
  return (
    <script
      type="application/ld+json"
      data-structured="breadcrumbs"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Inicio",
              "item": "https://itelsa-go.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Panel",
              "item": "https://itelsa-go.com/panel"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Mis Propiedades",
              "item": "https://itelsa-go.com/panel/listings"
            }
          ]
        })
      }}
    />
  );
}
