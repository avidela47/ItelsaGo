import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import User from "@/models/User";

/**
 * GET /api/user/me
 * Retorna información del usuario autenticado
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const userId = req.cookies.get("uid")?.value;
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
    });
  } catch (err: any) {
    console.error("GET /api/user/me error:", err);
    return NextResponse.json(
      { error: err.message || "Error del servidor" },
      { status: 500 }
    );
  }
}
