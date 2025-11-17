import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";

/**
 * GET /api/agency/listings
 * Retorna las propiedades de la agencia autenticada
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

    const listings = await Listing.find({ agency: agencyId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      ok: true,
      listings: listings.map((l: any) => ({
        _id: l._id.toString(),
        title: l.title,
        location: l.location,
        price: l.price,
        currency: l.currency,
        propertyType: l.propertyType,
        rooms: l.rooms,
        views: l.views || 0,
        featured: l.featured || false,
        createdAt: l.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("GET /api/agency/listings error:", err);
    return NextResponse.json(
      { error: err.message || "Error del servidor" },
      { status: 500 }
    );
  }
}
