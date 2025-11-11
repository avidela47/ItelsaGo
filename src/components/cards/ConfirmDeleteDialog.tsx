"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void; // acción de borrado
  title?: string; // ej: "Eliminar publicación"
  hint?: string;  // ej: 'Escribí "ELIMINAR" para confirmar'
  requireText?: string; // ej: "ELIMINAR"
};

export default function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title = "Eliminar",
  hint = 'Escribí "ELIMINAR" para confirmar.',
  requireText = "ELIMINAR",
}: Props) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  useEffect(() => {
    if (!open) {
      setValue("");
      setBusy(false);
      setMsg(null);
    }
  }, [open]);

  const canConfirm = value.trim().toUpperCase() === requireText;

  async function handleConfirm() {
    if (!canConfirm || busy) return;
    try {
      setBusy(true);
      await onConfirm();
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || "No se pudo eliminar" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
        <Alert severity="warning">
          Esta acción <b>no se puede deshacer</b>. Se eliminará definitivamente.
        </Alert>
        <small style={{ opacity: 0.8 }}>{hint}</small>
        <TextField
          autoFocus
          placeholder={requireText}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={busy}
        />
        {msg && (
          <Alert severity={msg.type === "ok" ? "success" : "error"}>{msg.text}</Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={busy} color="inherit" variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!canConfirm || busy}
          color="error"
          variant="contained"
        >
          {busy ? "Eliminando..." : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
