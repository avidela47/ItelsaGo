import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import Agency from "@/models/Agency"; // ✅ Importar Agency para que Mongoose lo registre
import { isAdminFromRequest } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    
    const item = await Listing.findById(params.id)
      .populate("agency")
      .lean();
      
    if (!item) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch (err: any) {
    console.error("GET /api/listings/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    
    const isAdmin = isAdminFromRequest(req);
    const role = req.cookies.get("role")?.value;
    
    // Verificar permisos
    if (!isAdmin && role !== "agency") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      location,
      price,
      currency,
      rooms,
      propertyType,
      operationType,
      images,
      description,
      agency,
      lat,
      lng,
    } = body;

    // Si es agency, verificar que sea dueño de la propiedad
    if (role === "agency" && !isAdmin) {
      const agencyId = req.cookies.get("agencyId")?.value;
      const existingItem = await Listing.findById(params.id).lean();
      
      if (!existingItem) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      }
      
      const itemAgencyId = String((existingItem as any).agency);
      if (itemAgencyId !== agencyId) {
        return NextResponse.json(
          { error: "No podés editar propiedades de otras inmobiliarias" },
          { status: 403 }
        );
      }
    }

    const update: any = {
      title,
      location,
      price,
      currency,
      rooms,
      propertyType,
      operationType,
      description,
      agency,
      lat,
      lng,
    };

    if (images) {
      update.images = Array.isArray(images)
        ? images
        : String(images)
            .split(",")
            .map((x: string) => x.trim())
            .filter(Boolean);
    }

    const item = await Listing.findByIdAndUpdate(params.id, update, {
      new: true,
    }).lean();

    if (!item) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch (err: any) {
    console.error("PUT /api/listings/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    
    const isAdmin = isAdminFromRequest(req);
    const role = req.cookies.get("role")?.value;
    
    // Verificar permisos
    if (!isAdmin && role !== "agency") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Si es agency, verificar que sea dueño de la propiedad
    if (role === "agency" && !isAdmin) {
      const agencyId = req.cookies.get("agencyId")?.value;
      const existingItem = await Listing.findById(params.id).lean();
      
      if (!existingItem) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      }
      
      const itemAgencyId = String((existingItem as any).agency);
      if (itemAgencyId !== agencyId) {
        return NextResponse.json(
          { error: "No podés eliminar propiedades de otras inmobiliarias" },
          { status: 403 }
        );
      }
    }

    const deleted = await Listing.findByIdAndDelete(params.id).lean();
    if (!deleted) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/listings/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno" },
      { status: 500 }
    );
  }
}






