"use client";

import { Box, Container } from "@mui/material";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #061016 0%, #0a1a24 50%, #0d2433 100%)",
        color: "#e9edf2",
        py: 4,
      }}
    >
      <Container maxWidth="xl">{children}</Container>
    </Box>
  );
}
