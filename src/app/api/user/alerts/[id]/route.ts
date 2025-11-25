import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Alert from "@/models/Alert";

// PATCH: Activar/desactivar alerta
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const userId = req.cookies.get("uid")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const { active } = await req.json();
    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "Valor 'active' requerido" }, { status: 400 });
    }
    const alert = await Alert.findOneAndUpdate(
      { _id: params.id, user: userId },
      { active },
      { new: true }
    );
    if (!alert) {
      return NextResponse.json({ error: "Alerta no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, alert });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al actualizar alerta" }, { status: 500 });
  }
}

// DELETE: Eliminar alerta
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const userId = req.cookies.get("uid")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const alert = await Alert.findOneAndDelete({ _id: params.id, user: userId });
    if (!alert) {
      return NextResponse.json({ error: "Alerta no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al eliminar alerta" }, { status: 500 });
  }
}
