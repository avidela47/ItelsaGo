"use client";

import styles from "./PropertyCard.module.css";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";

type Item = {
  _id: string;
  title: string;
  price: number;
  currency: "ARS" | "USD";
  location: string;
  images: string[];
  rooms?: number;
  propertyType?: "depto" | "casa" | "lote" | "local";
  agency?: { logo?: string; plan?: "premium" | "sponsor" | "free" };
  createdAt?: string;
};

function fmtCurrency(n: number, cur: "ARS" | "USD") {
  const prefix = cur === "USD" ? "USD " : "$ ";
  return `${prefix}${new Intl.NumberFormat("es-AR").format(n)}`;
}

function isNuevo(createdAt?: string) {
  if (!createdAt) return false;
  const d = Date.parse(createdAt);
  return !Number.isNaN(d) && Date.now() - d <= 30 * 24 * 60 * 60 * 1000;
}

export default function PropertyCard({ item }: { item: Item }) {
  const img = item.images?.[0] || "/placeholder.jpg";
  const plan = (item.agency?.plan || "free").toUpperCase(); // PREMIUM / SPONSOR / FREE
  const nuevo = isNuevo(item.createdAt);

  return (
    <Link href={`/inmuebles/${item._id}`} className={styles.card}>
      <div className={styles.media}>
        {/* La imagen queda SIEMPRE contenida a 220px con object-fit:cover */}
        <img src={img} alt={item.title} loading="lazy" />
        <span className={styles.badgePlan}>{plan}</span>
        {nuevo && <span className={styles.badgeNuevo}>NUEVO</span>}
      </div>

      <div className={styles.content}>
        <Typography className={styles.price} variant="h6">
          {fmtCurrency(item.price, item.currency || "USD")}
        </Typography>

        <Typography className={styles.title}>{item.title}</Typography>

        <Box className={styles.meta}>
          <span>{item.location}</span>
          {typeof item.rooms === "number" && <span>{item.rooms} amb</span>}
          {item.propertyType && (
            <span>
              {item.propertyType === "depto"
                ? "Departamento"
                : item.propertyType === "casa"
                ? "Casa"
                : item.propertyType === "lote"
                ? "Lote"
                : "Local"}
            </span>
          )}
        </Box>
      </div>
    </Link>
  );
}










