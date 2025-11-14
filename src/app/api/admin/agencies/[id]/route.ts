import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Agency from "@/models/Agency";

// PATCH: Actualizar inmobiliaria
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await req.json();
    
    const { name, email, phone, whatsapp, plan, logo } = body;
    
    const agency = await Agency.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        whatsapp,
        plan,
        logo,
      },
      { new: true }
    );
    
    if (!agency) {
      return NextResponse.json(
        { error: "Inmobiliaria no encontrada" },
        { status: 404 }
      );
    }
    
    console.log("✅ Inmobiliaria actualizada:", agency.name);
    
    return NextResponse.json({
      ok: true,
      agency,
      message: "Inmobiliaria actualizada exitosamente",
    });
  } catch (error: any) {
    console.error("Error en PATCH /api/admin/agencies/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar inmobiliaria" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar inmobiliaria
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    
    const agency = await Agency.findByIdAndDelete(id);
    
    if (!agency) {
      return NextResponse.json(
        { error: "Inmobiliaria no encontrada" },
        { status: 404 }
      );
    }
    
    console.log("✅ Inmobiliaria eliminada:", agency.name);
    
    return NextResponse.json({
      ok: true,
      message: "Inmobiliaria eliminada exitosamente",
    });
  } catch (error: any) {
    console.error("Error en DELETE /api/admin/agencies/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar inmobiliaria" },
      { status: 500 }
    );
  }
}
