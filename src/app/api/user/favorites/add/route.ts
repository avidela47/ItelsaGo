import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Agency from "@/models/Agency";
import { sendEmail } from "@/lib/sendAlertEmails";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Obtener userId de las cookies
    const userId = req.cookies.get("uid")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { listingId } = await req.json();
    if (!listingId) {
      return NextResponse.json({ error: "listingId requerido" }, { status: 400 });
    }

    // Verificar que el listing existe y obtener agencia
    const listing = await Listing.findById(listingId).populate("agency");
    if (!listing) {
      return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    // Agregar a favoritos (evita duplicados con $addToSet)
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteListings: listingId } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }


    // Notificar por email a la agencia/propietario si tiene email
    const agencyEmail = listing.agency?.email;
    if (agencyEmail) {
      const subject = `¡Tu propiedad fue marcada como favorita!`;
      const html = `<h2>¡Felicidades!</h2>
        <p>Tu propiedad <b>${listing.title}</b> (${listing.location}) fue agregada a favoritos por un usuario en ITELSA Go.</p>
        <p>Esto aumenta las chances de recibir una consulta o cerrar una operación.</p>
        <hr />
        <small>ITELSA Go - Plataforma inmobiliaria premium</small>`;
      sendEmail({ to: agencyEmail, subject, html });
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Agregado a favoritos",
      favorites: user.favoriteListings 
    });

  } catch (error: any) {
    console.error("Error agregando favorito:", error);
    return NextResponse.json({ error: error.message || "Error al agregar favorito" }, { status: 500 });
  }
}
