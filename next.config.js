const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Habilitar el dominio externo de imágenes
  images: {
    // Permitir dominios externos usados en next/image
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.21online.lat",
      },
      {
        protocol: "https",
        hostname: "imgar.zonapropcdn.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "d1acdg20u0pmxj.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "pic.le-cdn.com",
      },
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

module.exports = withBundleAnalyzer(nextConfig);

