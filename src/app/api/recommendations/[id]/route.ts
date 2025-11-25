import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";

/**
 * GET /api/recommendations/[id]
 * Retorna propiedades recomendadas basadas en la propiedad actual
 * Algoritmo de scoring:
 * - Mismo tipo: +10 puntos
 * - Misma operación: +8 puntos
 * - Precio similar (±20%): +7 puntos
 * - Ubicación similar (mismo texto): +6 puntos
 * - Ambientes similares (±1): +5 puntos
 * - Misma agencia: +3 puntos
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    // Obtener la propiedad actual
    const currentListing: any = await Listing.findById(id).lean();
    
    if (!currentListing) {
      return NextResponse.json(
        { ok: false, error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    // Obtener todas las propiedades excepto la actual
    const allListings: any[] = await Listing.find({ _id: { $ne: id } })
      .select("_id title price currency location images rooms propertyType operationType agency bedrooms bathrooms")
      .lean();

    // Calcular score para cada propiedad
    const scoredListings = allListings.map((listing: any) => {
      let score = 0;
      const reasons: string[] = [];

      // Mismo tipo de propiedad
      if (listing.propertyType === currentListing.propertyType) {
        score += 10;
        reasons.push("Mismo tipo");
      }

      // Misma operación (venta/alquiler)
      if (listing.operationType === currentListing.operationType) {
        score += 8;
        reasons.push("Misma operación");
      }

      // Precio similar (±20%)
      if (listing.currency === currentListing.currency) {
        const priceDiff = Math.abs(listing.price - currentListing.price) / currentListing.price;
        if (priceDiff <= 0.20) {
          score += 7;
          reasons.push("Precio similar");
        }
      }

      // Ubicación similar (contiene palabras en común)
      if (listing.location && currentListing.location) {
        const currentWords = currentListing.location.toLowerCase().split(/\s+/);
        const listingWords = listing.location.toLowerCase().split(/\s+/);
        const commonWords = currentWords.filter((word: string) => 
          listingWords.includes(word) && word.length > 3
        );
        if (commonWords.length > 0) {
          score += 6 * commonWords.length;
          reasons.push("Zona cercana");
        }
      }

      // Ambientes similares (±1)
      if (listing.rooms && currentListing.rooms) {
        const roomsDiff = Math.abs(listing.rooms - currentListing.rooms);
        if (roomsDiff <= 1) {
          score += 5;
          reasons.push("Ambientes similares");
        }
      }

      // Misma agencia
      if (listing.agency && currentListing.agency && 
          listing.agency.toString() === currentListing.agency.toString()) {
        score += 3;
        reasons.push("Misma inmobiliaria");
      }

      return {
        ...listing,
        _score: score,
        _reasons: reasons,
      };
    });

    // Ordenar por score y tomar los top 6
    const recommendations = scoredListings
      .sort((a, b) => b._score - a._score)
      .filter(item => item._score > 0) // Solo recomendar si hay al menos 1 razón
      .slice(0, 6);

    return NextResponse.json(
      {
        ok: true,
        recommendations,
        total: recommendations.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error: any) {
    console.error("Error en /api/recommendations:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
