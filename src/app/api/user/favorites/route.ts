import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Obtener userId de las cookies
    const userId = req.cookies.get("uid")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener usuario con favoritos populados
    const user = await User.findById(userId).populate({
      path: "favoriteListings",
      populate: {
        path: "agency",
        select: "name logo plan whatsapp",
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ 
      ok: true,
      favorites: user.favoriteListings || [],
      count: user.favoriteListings?.length || 0
    });

  } catch (error: any) {
    console.error("Error obteniendo favoritos:", error);
    return NextResponse.json({ error: error.message || "Error al obtener favoritos" }, { status: 500 });
  }
}
