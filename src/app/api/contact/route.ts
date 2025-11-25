import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendAlertEmails";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import Contact from "@/models/Contact";



export async function POST(req: NextRequest) {
  try {
    // Verificar API key
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY no está configurada");
      return NextResponse.json(
        { error: "Configuración de email faltante. Contactá al administrador." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { listingId, name, email, phone, message } = body;

    console.log("📧 Recibiendo consulta:", { listingId, name, email });

    // Validaciones básicas
    if (!listingId || !name || !email || !message) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Buscar la propiedad y la inmobiliaria
    await dbConnect();
    const listing = await Listing.findById(listingId).populate("agency");

    console.log("🏠 Propiedad encontrada:", listing?.title);
    console.log("🏢 Inmobiliaria:", listing?.agency?.name);

    if (!listing) {
      console.error("❌ Propiedad no encontrada:", listingId);
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    const agencyEmail = listing.agency?.email || "arielvidela37@gmail.com"; // Email por defecto para testing
    const agencyName = listing.agency?.name || "Inmobiliaria";

    // Registrar el contacto en la base de datos
    const contact = await Contact.create({
      listing: listingId,
      agency: listing.agency?._id,
      name,
      email,
      phone,
      message,
      status: "pending",
    });

    console.log("💾 Contacto registrado en BD:", contact._id);
    console.log("📬 Enviando email a:", agencyEmail);

    // Construir HTML del email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2A6EBB; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .property { background: white; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2A6EBB; }
            .info { margin: 10px 0; }
            .label { font-weight: bold; color: #2A6EBB; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Nueva Consulta - ITELSA Go</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${agencyName}</strong>,</p>
              <p>Recibiste una nueva consulta sobre tu propiedad:</p>
              
              <div class="property">
                <h3>${listing.title}</h3>
                <p><strong>Ubicación:</strong> ${listing.location}</p>
                <p><strong>Precio:</strong> ${listing.currency} ${new Intl.NumberFormat("es-AR").format(listing.price)}</p>
              </div>

              <div class="info">
                <p class="label">👤 Nombre:</p>
                <p>${name}</p>
              </div>

              <div class="info">
                <p class="label">📧 Email:</p>
                <p><a href="mailto:${email}">${email}</a></p>
              </div>

              ${phone ? `
              <div class="info">
                <p class="label">📱 Teléfono:</p>
                <p><a href="tel:${phone}">${phone}</a></p>
              </div>
              ` : ''}

              <div class="info">
                <p class="label">💬 Mensaje:</p>
                <p style="background: white; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${message}</p>
              </div>

              <p style="margin-top: 30px;">
                <strong>Respondé lo antes posible para no perder la oportunidad.</strong>
              </p>

              <div class="footer">
                <p>Este email fue enviado desde <strong>ITELSA Go</strong></p>
                <p>Tu plataforma inmobiliaria de confianza</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;


    // Enviar email a la inmobiliaria usando SendGrid
    await sendEmail({
      to: agencyEmail,
      subject: `Nueva consulta: ${listing.title}`,
      html: htmlContent,
    });

    return NextResponse.json({
      ok: true,
      message: "Consulta enviada exitosamente"
    });

  } catch (error: any) {
    console.error("❌ Error en /api/contact:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
