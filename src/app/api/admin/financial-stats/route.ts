import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import User from "@/models/User";

/**
 * GET /api/admin/financial-stats
 * Devuelve estadísticas financieras para el dashboard admin:
 * - Ingresos mensuales recurrentes (MRR)
 * - Ingresos anuales proyectados (ARR)
 * - Distribución por plan (PRO/PREMIUM)
 * - Nuevas suscripciones este mes
 * - Tendencia últimos 6 meses
 */

const PLAN_PRICES = {
  free: 0,
  pro: 100,
  premium: 500,
};

export async function GET() {
  try {
    await dbConnect();

    // Obtener todas las agencies (users con role=agency)
    const agencies = await User.find({ role: "agency" }).lean();

    // Calcular MRR (Monthly Recurring Revenue)
    let mrrTotal = 0;
    let mrrPro = 0;
    let mrrPremium = 0;
    let countPro = 0;
    let countPremium = 0;

    agencies.forEach((agency: any) => {
      const plan = agency.plan || "free";
      const price = PLAN_PRICES[plan as keyof typeof PLAN_PRICES] || 0;
      
      mrrTotal += price;
      
      if (plan === "pro") {
        mrrPro += price;
        countPro++;
      } else if (plan === "premium") {
        mrrPremium += price;
        countPremium++;
      }
    });

    // ARR (Annual Recurring Revenue)
    const arr = mrrTotal * 12;

    // Nuevas suscripciones este mes (PRO y PREMIUM)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const newSubscriptions = agencies.filter((agency: any) => {
      if (!agency.subscriptionDate) return false;
      const subDate = new Date(agency.subscriptionDate);
      return subDate >= startOfMonth && (agency.plan === "pro" || agency.plan === "premium");
    });

    const newSubsPro = newSubscriptions.filter((a: any) => a.plan === "pro").length;
    const newSubsPremium = newSubscriptions.filter((a: any) => a.plan === "premium").length;

    // Tendencia últimos 6 meses (simulado por ahora)
    // En producción, esto debería calcularse con datos históricos reales
    const last6Months: Array<{ month: string; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("es-AR", { month: "short" });
      
      // Simulamos un crecimiento gradual (en producción usarías datos reales)
      const factor = 0.7 + (i * 0.05); // Crece del 70% al 95% del MRR actual
      const revenue = Math.round(mrrTotal * factor);
      
      last6Months.push({
        month: monthName,
        revenue,
      });
    }

    return NextResponse.json({
      ok: true,
      financial: {
        mrr: {
          total: mrrTotal,
          pro: mrrPro,
          premium: mrrPremium,
        },
        arr,
        subscriptions: {
          pro: countPro,
          premium: countPremium,
          total: countPro + countPremium,
        },
        newThisMonth: {
          pro: newSubsPro,
          premium: newSubsPremium,
          total: newSubsPro + newSubsPremium,
        },
        trend: last6Months,
      },
    });
  } catch (err: any) {
    console.error("Error en /api/admin/financial-stats:", err);
    return NextResponse.json(
      { error: err?.message || "Error al obtener estadísticas financieras" },
      { status: 500 }
    );
  }
}
