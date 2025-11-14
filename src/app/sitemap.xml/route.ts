import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    
    // Traer solo propiedades activas
    const listings = await Listing.find({
      $or: [
        { status: { $exists: false } },
        { status: "active" }
      ]
    })
    .select("_id updatedAt createdAt")
    .lean();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    // Generar XML del sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Página principal -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Listado de inmuebles -->
  <url>
    <loc>${baseUrl}/inmuebles</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Publicar inmueble -->
  <url>
    <loc>${baseUrl}/publicar</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Cada propiedad activa -->
  ${listings.map((listing) => {
    const lastmod = listing.updatedAt || listing.createdAt || new Date();
    return `<url>
    <loc>${baseUrl}/inmuebles/${listing._id}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join("\n  ")}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
