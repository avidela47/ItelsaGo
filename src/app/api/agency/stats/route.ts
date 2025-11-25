import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import Agency from "@/models/Agency";
import Contact from "@/models/Contact";

/**
 * GET /api/agency/stats
 * Retorna estadísticas de la agencia autenticada
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const agencyId = req.cookies.get("agencyId")?.value;
    const role = req.cookies.get("role")?.value;

    if (role !== "agency" || !agencyId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener todas las propiedades de la agencia
    const listings = await Listing.find({ agency: agencyId }).lean();

    // Calcular estadísticas
    const totalProperties = listings.length;
    const totalViews = listings.reduce((sum: number, l: any) => sum + (l.views || 0), 0);
    const featuredProperties = listings.filter((l: any) => l.featured).length;

    // Obtener estadísticas de contactos
    const totalContacts = await Contact.countDocuments({ agency: agencyId });
    const pendingContacts = await Contact.countDocuments({ agency: agencyId, status: "pending" });

    return NextResponse.json({
      ok: true,
      totalProperties,
      totalViews,
      featuredProperties,
      totalContacts,
      pendingContacts,
    });
  } catch (err: any) {
    console.error("GET /api/agency/stats error:", err);
    return NextResponse.json(
      { error: err.message || "Error del servidor" },
      { status: 500 }
    );
  }
}
