import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Listing from "@/models/Listing";

/**
 * GET /api/admin/financial-stats
 * Devuelve estadísticas financieras para el dashboard admin:
 * - Ingresos mensuales recurrentes (MRR) basados en listings
 * - Ingresos anuales proyectados (ARR)
 * - Distribución por plan (PRO/PREMIUM)
 * - Nuevas publicaciones este mes
 * - Tendencia últimos 6 meses
 */

const PLAN_PRICES = {
  free: 0,
  pro: 100,
  premium: 500,
  sponsor: 100, // Alias de pro
};

export async function GET() {
  try {
    await dbConnect();

    // Obtener todos los listings activos con sus planes
    const listings = await Listing.find({}).select("agency createdAt").lean();

    // Calcular MRR (Monthly Recurring Revenue)
    let mrrTotal = 0;
    let mrrPro = 0;
    let mrrPremium = 0;
    let countPro = 0;
    let countPremium = 0;

    listings.forEach((listing: any) => {
      const plan = listing.agency?.plan || "free";
      const normalizedPlan = plan === "sponsor" ? "pro" : plan;
      const price = PLAN_PRICES[normalizedPlan as keyof typeof PLAN_PRICES] || 0;
      
      mrrTotal += price;
      
      if (normalizedPlan === "pro") {
        mrrPro += price;
        countPro++;
      } else if (normalizedPlan === "premium") {
        mrrPremium += price;
        countPremium++;
      }
    });

    // ARR (Annual Recurring Revenue)
    const arr = mrrTotal * 12;

    // Nuevas publicaciones este mes (PRO y PREMIUM)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const newListings = listings.filter((listing: any) => {
      if (!listing.createdAt) return false;
      const createDate = new Date(listing.createdAt);
      const plan = listing.agency?.plan || "free";
      const normalizedPlan = plan === "sponsor" ? "pro" : plan;
      return createDate >= startOfMonth && (normalizedPlan === "pro" || normalizedPlan === "premium");
    });

    const newPro = newListings.filter((l: any) => {
      const plan = l.agency?.plan || "free";
      return plan === "pro" || plan === "sponsor";
    }).length;
    
    const newPremium = newListings.filter((l: any) => 
      l.agency?.plan === "premium"
    ).length;

    // Tendencia últimos 6 meses
    const last6Months: Array<{ month: string; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = date.toLocaleDateString("es-AR", { month: "short" });
      
      // Calcular ingresos de ese mes basado en listings creados hasta esa fecha
      const listingsUntilMonth = listings.filter((l: any) => {
        if (!l.createdAt) return false;
        const createDate = new Date(l.createdAt);
        return createDate < nextMonth;
      });
      
      let monthRevenue = 0;
      listingsUntilMonth.forEach((l: any) => {
        const plan = l.agency?.plan || "free";
        const normalizedPlan = plan === "sponsor" ? "pro" : plan;
        monthRevenue += PLAN_PRICES[normalizedPlan as keyof typeof PLAN_PRICES] || 0;
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
