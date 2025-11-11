/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Habilitar el dominio externo de imágenes
  images: {
    // Método simple
    domains: ["cdn.21online.lat"],

    // Método recomendado (por si cambian paths o protocolos)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.21online.lat",
      }
    ],
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/inmuebles',
        permanent: true, // 308 permanente
      },
    ];
  },
};

module.exports = nextConfig;

