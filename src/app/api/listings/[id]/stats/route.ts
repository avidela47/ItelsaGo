import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Visit from "@/models/Visit";
import User from "@/models/User";
import Listing from "@/models/Listing";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const listingId = params.id;
    if (!listingId) {
      return NextResponse.json({ error: "listingId requerido" }, { status: 400 });
    }
    // Total de visitas
    const totalVisits = await Visit.countDocuments({ listing: listingId });
    // Visitas por día (últimos 30 días)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const visitsByDayAgg = await Visit.aggregate([
      { $match: { listing: new (require('mongoose')).Types.ObjectId(listingId), date: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    // Favoritos
    const users = await User.find({ favoriteListings: listingId });
    const totalFavs = users.length;
    // Respuesta
    return NextResponse.json({
      ok: true,
      totalVisits,
      visitsByDay: visitsByDayAgg,
      totalFavs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al obtener stats" }, { status: 500 });
  }
}
