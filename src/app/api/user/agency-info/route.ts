import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Agency from "@/models/Agency";
import Listing from "@/models/Listing";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const role = req.cookies.get("role")?.value;
    
    if (role !== "agency") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const agencyId = req.cookies.get("agencyId")?.value;
    
    if (!agencyId) {
      return NextResponse.json({ error: "No se encontró tu inmobiliaria" }, { status: 404 });
    }

    // Obtener info de la agency
    const agency = await Agency.findById(agencyId).lean();
    
    if (!agency) {
      return NextResponse.json({ error: "Inmobiliaria no encontrada" }, { status: 404 });
    }

    const plan = (agency as any).plan || "free";
    
    // Contar propiedades activas
    const propertiesCount = await Listing.countDocuments({ 
      agency: agencyId,
      status: { $ne: "suspended" }
    });

    // Definir límites
    const limits: Record<string, number> = {
      free: 3,
      pro: 10,
      premium: 999999,
    };

    const limit = limits[plan] || 3;

    return NextResponse.json({
      ok: true,
      name: (agency as any).name || "Mi Inmobiliaria",
      plan,
      logo: (agency as any).logo || null,
      propertiesCount,
      limit,
      remaining: Math.max(0, limit - propertiesCount),
    });
  } catch (err: any) {
    console.error("GET /api/user/agency-info error:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}
