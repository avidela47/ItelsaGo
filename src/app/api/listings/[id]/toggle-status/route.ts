import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";

/**
 * PATCH /api/listings/[id]/toggle-status
 * Cambia el estado de una propiedad entre "active" y "suspended"
 * Solo admin puede usar este endpoint
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400 }
      );
    }

    // Buscar el listing
    const listing = await Listing.findById(id);

    if (!listing) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    // Toggle status
    const currentStatus = listing.status || "active";
    const newStatus = currentStatus === "active" ? "suspended" : "active";

    listing.status = newStatus;
    await listing.save();

    return NextResponse.json({
      ok: true,
      status: newStatus,
      message: `Propiedad ${newStatus === "active" ? "activada" : "suspendida"} exitosamente`,
    });
  } catch (err: any) {
    console.error("Error en toggle-status:", err);
    return NextResponse.json(
      { error: err?.message || "Error al cambiar estado" },
      { status: 500 }
    );
  }
}
