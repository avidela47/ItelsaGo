import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";
import Agency from "@/models/Agency";
import { PLAN_PRICES } from "@/lib/planPrices";

/**
 * GET /api/admin/financial-stats
 * Devuelve estadísticas financieras para el dashboard admin:
 * - Ingresos mensuales recurrentes (MRR) basados en listings
 * - Ingresos anuales proyectados (ARR)
 * - Distribución por plan (PRO/PREMIUM)
 * - Nuevas publicaciones este mes
 * - Tendencia últimos 6 meses
 */

// Valores actuales de los planes (USD): PRO = 100, PREMIUM = 500
// Precios importados desde src/lib/planPrices.ts

export async function GET() {
  try {
    await dbConnect();


    // Obtener todas las agencias activas y contar por plan
  const agencies = await Agency.find({}).select("plan createdAt").lean();
    let countPro = 0;
    let countPremium = 0;
    let mrrPro = 0;
    let mrrPremium = 0;
    agencies.forEach((agency: any) => {
      if (agency.plan === "pro" || agency.plan === "sponsor") {
        countPro++;
        mrrPro += PLAN_PRICES.pro;
      } else if (agency.plan === "premium") {
        countPremium++;
        mrrPremium += PLAN_PRICES.premium;
      }
    });
    const mrrTotal = mrrPro + mrrPremium;

  // ARR (Annual Recurring Revenue)
  const arr = mrrTotal * 12;

    // Nuevas altas de agencias este mes (PRO y PREMIUM)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Nuevas altas de agencias PRO y PREMIUM este mes
    const newPro = agencies.filter((agency: any) => {
      if (!agency.createdAt) return false;
      const createDate = new Date(agency.createdAt);
      return createDate >= startOfMonth && (agency.plan === "pro" || agency.plan === "sponsor");
    }).length;
    const newPremium = agencies.filter((agency: any) => {
      if (!agency.createdAt) return false;
      const createDate = new Date(agency.createdAt);
      return createDate >= startOfMonth && agency.plan === "premium";
    }).length;

    // Tendencia últimos 6 meses (por agencias activas en cada mes)
    const last6Months: Array<{ month: string; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = date.toLocaleDateString("es-AR", { month: "short" });
      // Agencias activas hasta ese mes
      const agenciesUntilMonth = agencies.filter((a: any) => {
        if (!a.createdAt) return false;
        const createDate = new Date(a.createdAt);
        return createDate < nextMonth;
      });
      let monthRevenue = 0;
      agenciesUntilMonth.forEach((a: any) => {
        if (a.plan === "pro" || a.plan === "sponsor") monthRevenue += PLAN_PRICES.pro;
        else if (a.plan === "premium") monthRevenue += PLAN_PRICES.premium;
      });
      last6Months.push({
        month: monthName,
        revenue: monthRevenue,
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
          pro: newPro,
          premium: newPremium,
          total: newPro + newPremium,
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
