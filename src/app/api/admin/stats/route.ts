import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import Agency from "@/models/Agency";
import User from "@/models/User";

/**
 * GET /api/admin/stats
 * Devuelve estadísticas para el dashboard admin:
 * - Total de propiedades por plan
 * - Total de usuarios por rol
 * - Últimas 10 propiedades creadas
 */
export async function GET(req: NextRequest) {
  const cookieRole = req.cookies.get("role")?.value || null;
  if (cookieRole !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    await dbConnect();

    // Total de propiedades por plan
    const listings = await Listing.find({})
      .sort({ createdAt: -1 })
      .populate("agency")
      .lean();
    
    const planCounts = {
      free: 0,
      pro: 0,
      premium: 0,
      total: listings.length,
    };

    listings.forEach((listing: any) => {
      const plan = listing.agency?.plan || "free";
      // Normalizar sponsor -> pro
      const normalizedPlan = plan === "sponsor" ? "pro" : plan;
      if (normalizedPlan === "free") planCounts.free++;
      else if (normalizedPlan === "pro") planCounts.pro++;
      else if (normalizedPlan === "premium") planCounts.premium++;
    });

    // Total de usuarios por rol
    const users = await User.find({}).select("role").lean();
    const roleCounts = {
      user: 0,
      agency: 0,
      admin: 0,
      total: users.length,
    };

    users.forEach((user: any) => {
      if (user.role === "user") roleCounts.user++;
      else if (user.role === "agency") roleCounts.agency++;
      else if (user.role === "admin") roleCounts.admin++;
    });

    // Últimas 10 propiedades
    const latestListings = listings
      .slice(0, 10)
      .map((l: any) => {
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
          _id: String(l._id),
          title: l.title,
          location: l.location,
          price: l.price,
          currency: l.currency,
          plan: agencyObj?.plan || 'free',
          agency: agencyObj,
          warningAgency,
          propertyType: l.propertyType,
          createdAt: l.createdAt,
        };
      });

    return NextResponse.json({
      ok: true,
      stats: {
        plans: planCounts,
        roles: roleCounts,
        latestListings,
      },
    });
  } catch (err: any) {
    console.error("Error en /api/admin/stats:", err);
    return NextResponse.json(
      { error: err?.message || "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
