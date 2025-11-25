import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import Contact from "@/models/Contact";
import User from "@/models/User";

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

    // Obtener IDs de las propiedades
    const listingIds = listings.map((l: any) => l._id);

    // Consultas (Contactos) agrupadas por propiedad
    const contactsAgg = await Contact.aggregate([
      { $match: { listing: { $in: listingIds } } },
      { $group: { _id: "$listing", count: { $sum: 1 } } }
    ]);
    const contactsMap = Object.fromEntries(contactsAgg.map((c) => [c._id.toString(), c.count]));

    // Favoritos agrupados por propiedad
    const favAgg = await User.aggregate([
      { $unwind: "$favoriteListings" },
      { $match: { favoriteListings: { $in: listingIds } } },
      { $group: { _id: "$favoriteListings", count: { $sum: 1 } } }
    ]);
    const favMap = Object.fromEntries(favAgg.map((f) => [f._id.toString(), f.count]));

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
        favorites: favMap[l._id.toString()] || 0,
        contacts: contactsMap[l._id.toString()] || 0,
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
