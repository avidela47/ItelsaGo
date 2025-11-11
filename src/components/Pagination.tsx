"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

type Props = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, perPage, total, onPageChange }: Props) {
  const { pages, from, to } = useMemo(() => {
    const pages = Math.max(1, Math.ceil(total / perPage));
    const from = total === 0 ? 0 : (page - 1) * perPage + 1;
    const to = Math.min(total, page * perPage);
    return { pages, from, to };
  }, [page, perPage, total]);

  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        justifyContent: "space-between",
        flexWrap: "wrap",
        my: 2,
      }}
    >
      <Typography sx={{ opacity: 0.8, fontSize: 14 }}>
        {total === 0 ? "Sin resultados" : `Mostrando ${from}–${to} de ${total}`}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => onPageChange(1)}
          disabled={!canPrev}
        >
          « Primero
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
        >
          ‹ Anterior
        </Button>

        <Typography sx={{ px: 1.5, minWidth: 90, textAlign: "center" }}>
          Página {page}
        </Typography>

        <Button
          variant="outlined"
          color="inherit"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
        >
          Siguiente ›
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => onPageChange(pages)}
          disabled={!canNext}
        >
          Última »
        </Button>
      </Box>
    </Box>
  );
}


