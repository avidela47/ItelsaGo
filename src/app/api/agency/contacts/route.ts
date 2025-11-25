import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/mongo";
import Contact from "@/models/Contact";

/**
 * GET /api/agency/contacts
 * Retorna todos los contactos de la agencia autenticada
 */
export async function GET(request: Request) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const role = cookieStore.get("role")?.value;
    const agencyId = cookieStore.get("agencyId")?.value;

    // Validar autenticación
    if (role !== "agency" || !agencyId) {
      return NextResponse.json(
        { ok: false, error: "No autorizado. Debes ser una agencia autenticada." },
        { status: 401 }
      );
    }

    // Buscar contactos de esta agencia
    const contacts = await Contact.find({ agency: agencyId })
      .populate("listing", "title location price currency images") // Traer datos de la propiedad
      .sort({ createdAt: -1 }) // Más recientes primero
      .lean();

    // Calcular estadísticas
    const totalContacts = contacts.length;
    const pendingContacts = contacts.filter((c) => c.status === "pending").length;
    const contactedContacts = contacts.filter((c) => c.status === "contacted").length;

    return NextResponse.json({
      ok: true,
      contacts,
      stats: {
        total: totalContacts,
        pending: pendingContacts,
        contacted: contactedContacts,
      },
    });
  } catch (error: any) {
    console.error("Error en GET /api/agency/contacts:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/agency/contacts/:id
 * Actualiza el estado de un contacto
 */
export async function PATCH(request: Request) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const role = cookieStore.get("role")?.value;
    const agencyId = cookieStore.get("agencyId")?.value;

    if (role !== "agency" || !agencyId) {
      return NextResponse.json(
        { ok: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contactId, status } = body;

    if (!contactId || !status) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos: contactId, status" },
        { status: 400 }
      );
    }

    // Validar que el contacto pertenezca a esta agencia
    const contact = await Contact.findOne({ _id: contactId, agency: agencyId });
    if (!contact) {
      return NextResponse.json(
        { ok: false, error: "Contacto no encontrado o no autorizado" },
        { status: 404 }
      );
    }

    // Actualizar estado
    contact.status = status;
    await contact.save();

    return NextResponse.json({
      ok: true,
      contact,
    });
  } catch (error: any) {
    console.error("Error en PATCH /api/agency/contacts:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
