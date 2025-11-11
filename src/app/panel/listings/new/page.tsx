"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ListingForm from "@/components/admin/ListingForm";

export default function NewListingPage() {
  const router = useRouter();

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Typography variant="h5" fontWeight={800}>Nuevo inmueble</Typography>
      <ListingForm onSaved={(id) => router.push(id ? `/panel/listings/${id}` : "/panel/listings")} />
    </Box>
  );
}
