import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import User from "@/models/User";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    // Obtener userId de las cookies
    const userId = req.cookies.get("uid")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { listingId } = await req.json();
    if (!listingId) {
      return NextResponse.json({ error: "listingId requerido" }, { status: 400 });
    }

    // Quitar de favoritos
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favoriteListings: listingId } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Quitado de favoritos",
      favorites: user.favoriteListings 
    });

  } catch (error: any) {
    console.error("Error quitando favorito:", error);
    return NextResponse.json({ error: error.message || "Error al quitar favorito" }, { status: 500 });
  }
}
