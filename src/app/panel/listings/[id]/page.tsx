"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import ListingForm, { Listing } from "@/components/admin/ListingForm";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Listing | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/listings/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data?.item) setItem(data.item);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}><CircularProgress /></Box>;
  if (!item) return <Typography color="error">No encontrado</Typography>;

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h5" fontWeight={800}>Editar inmueble</Typography>
      <ListingForm initial={item} onSaved={() => router.refresh()} />
    </Box>
  );
}
