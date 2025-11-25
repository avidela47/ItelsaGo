import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import Contact from "@/models/Contact";
import User from "@/models/User";

/**
 * GET /api/admin/listings-metrics
 * Retorna todas las propiedades con métricas premium (favoritos, consultas, vistas, destacado)
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const listings = await Listing.find({}).sort({ createdAt: -1 }).populate("agency").lean();
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
      listings: listings.map((l: any) => {
        let warningAgency = '';
        let agencyObj: { _id?: string; name?: string; logo?: string; plan?: string } | null = null;
        if (!l.agency) {
          warningAgency = 'Sin agencia asignada';
          agencyObj = null;
        } else if (!l.agency.plan) {
          warningAgency = 'Agencia sin plan';
          agencyObj = {
            _id: l.agency._id?.toString(),
            name: l.agency.name,
            logo: l.agency.logo,
            plan: 'sin plan'
          };
        } else {
          agencyObj = {
            _id: l.agency._id?.toString(),
            name: l.agency.name,
            logo: l.agency.logo,
            plan: l.agency.plan
          };
        }
        return {
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
          agency: agencyObj,
          status: l.status,
          favorites: favMap[l._id.toString()] || 0,
          contacts: contactsMap[l._id.toString()] || 0,
          warningAgency,
        };
      })
    });
  } catch (err: any) {
    console.error("GET /api/admin/listings-metrics error:", err);
    return NextResponse.json(
      { error: err.message || "Error del servidor" },
      { status: 500 }
    );
  }
}
