"use client";

import Link from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import styles from "./PropertyCard.module.css";

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

function price(n?: number, cur: "ARS" | "USD" = "USD") {
  if (!n) return "";
  const sym = cur === "USD" ? "US$" : "$";
  return `${sym} ${n.toLocaleString("es-AR")}`;
}

export default function PropertyCard({ item }: { item: Item }) {
  const href = `/inmuebles/${item._id}`;
  const img = item.images?.[0] || "/placeholder.jpg";
  const isNew =
    item.createdAt && Date.now() - Date.parse(item.createdAt) < 7 * 24 * 60 * 60 * 1000;

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Card
        className={styles.card}
        sx={{
          "--card-h": "440px",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,.12)",
          bgcolor: "rgba(255,255,255,.03)",
          boxShadow: "0 12px 30px rgba(0,0,0,.35)",
          transition: "transform .15s ease, box-shadow .15s ease",
          "&:hover": { transform: "translateY(-2px)", boxShadow: "0 16px 40px rgba(0,0,0,.45)" },
        }}
      >
        {/* IMG */}
        <div className={styles.imgBox}>
          {/* badges */}
          {isNew && (
            <Chip
              label="NUEVO"
              size="small"
              className={styles.badgeLeft}
              sx={{ bgcolor: "#00e676", color: "#0b0b0f", fontWeight: 800 }}
            />
          )}
          {item.agency?.plan && (
            <Chip
              label={(item.agency.plan || "free").toUpperCase()}
              size="small"
              className={styles.badgeRight}
              sx={{
                fontWeight: 800,
                bgcolor:
                  item.agency.plan === "premium"
                    ? "#ffd54d"
                    : item.agency.plan === "sponsor"
                    ? "#22d3ee"
                    : "rgba(255,255,255,.75)",
                color: "#0b0b0f",
              }}
            />
          )}
          {/* logo inmobiliaria */}
          {item.agency?.logo && (
            <Box className={styles.logoBox}>
              <img src={item.agency.logo} alt="logo" className={styles.logoImg} />
            </Box>
          )}

          <img src={img} alt={item.title} className={styles.img} />
        </div>

        {/* BODY */}
        <CardContent className={styles.body}>
          <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
            {price(item.price, item.currency)}
          </Typography>

          <Typography className={styles.title}>{item.title}</Typography>

          <Typography sx={{ opacity: 0.8, mt: "auto", fontSize: 14 }}>
            {item.location}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}





