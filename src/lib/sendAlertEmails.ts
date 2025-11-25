import { dbConnect } from "@/lib/mongo";
import Alert from "@/models/Alert";
import User from "@/models/User";
import Listing from "@/models/Listing";

// Stub temporal para evitar error de compilación
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  console.log(`Simulando envío de email a ${to} con asunto '${subject}'`);
}

// Utilidad para comparar si un listing coincide con los criterios de la alerta
function matchesCriteria(listing: any, criteria: any): boolean {
  // Simplificado: puedes expandir según tus filtros
  if (criteria.location && criteria.location !== "all" && listing.location !== criteria.location) return false;
  if (criteria.type && criteria.type !== "all" && listing.propertyType !== criteria.type) return false;
  if (criteria.plan && criteria.plan !== "all" && listing.agency?.plan !== criteria.plan) return false;
  if (criteria.price) {
    const p = Number(listing.price || 0);
    if (p < criteria.price[0] || p > criteria.price[1]) return false;
  }
  // Agrega más filtros según tu lógica
  return true;
}

export async function sendDailyAlertEmails() {
  await dbConnect();
  const alerts = await Alert.find({ active: true }).populate("user");
  for (const alert of alerts) {
    const user = alert.user as any;
    if (!user?.email) continue;
    // Buscar propiedades nuevas desde la última notificación
    const since = alert.lastNotifiedAt || new Date(Date.now() - 24*60*60*1000);
    const listings = await Listing.find({ createdAt: { $gt: since } }).populate("agency");
    const matches = listings.filter((l: any) => matchesCriteria(l, alert.criteria));
    if (matches.length > 0) {
      // Enviar email
      await sendEmail({
        to: user.email,
        subject: "¡Nuevas propiedades que coinciden con tu alerta!",
        html: `<h2>¡Tienes ${matches.length} nuevas propiedades!</h2>` +
          matches.map((m: any) => `<div><b>${m.title}</b> - ${m.price} - ${m.location}</div>`).join("")
      });
      // Actualizar fecha de última notificación
      alert.lastNotifiedAt = new Date();
      await alert.save();
    }
  }
}
