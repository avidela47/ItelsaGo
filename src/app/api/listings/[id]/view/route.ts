import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";

/**
 * POST /api/listings/[id]/view
 * Incrementa el contador de vistas de una propiedad
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID de propiedad requerido" },
        { status: 400 }
      );
    }

    // Incrementar views en 1
    const listing = await Listing.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!listing) {
      return NextResponse.json(
        { ok: false, error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      views: listing.views || 1,
    });
  } catch (error: any) {
    console.error("Error incrementando vistas:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
