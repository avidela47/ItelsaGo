import { Box, Typography, Chip, IconButton, Tooltip, Button } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export type AgencyCardProps = {
  agency: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
    plan: "free" | "pro" | "premium";
    logo?: string;
    status?: "active" | "paused";
  };
  onEdit: () => void;
  onDelete: () => void;
  onTogglePause: () => void;
  onChangePlan: () => void;
};

function getPlanColor(plan: string) {
  if (plan === "premium") return "#D9A441";
  if (plan === "pro") return "#2A6EBB";
  return "#4CAF50";
}

export default function AgencyCard({ agency, onEdit, onDelete, onTogglePause, onChangePlan }: AgencyCardProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 3,
        boxShadow: 2,
        bgcolor: agency.status === "paused" ? "#ffeaea" : "#fff",
        mb: 2,
      }}
    >
      <Box sx={{ minWidth: 56, minHeight: 56, mr: 2 }}>
        {agency.logo ? (
          <img
            src={agency.logo}
            alt={agency.name}
            style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 10, background: "#fff", border: "1px solid #eee", boxShadow: "0 1px 4px #0001" }}
          />
        ) : (
          <BusinessIcon sx={{ fontSize: 48, opacity: 0.2 }} />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={700} fontSize={17} sx={{ mb: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{agency.name}</Typography>
        <Typography fontSize={14} color="text.secondary" sx={{ mb: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{agency.email}</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <Chip
            label={agency.plan?.toUpperCase() || "FREE"}
            size="small"
            onClick={onChangePlan}
            sx={{ bgcolor: getPlanColor(agency.plan || "free"), color: "#fff", fontWeight: 700, fontSize: 13, px: 1.5, borderRadius: 2, letterSpacing: 1, cursor: "pointer" }}
          />
          <Chip
            label={agency.status === "paused" ? "PAUSADA" : "ACTIVA"}
            size="small"
            sx={{ bgcolor: agency.status === "paused" ? "#ffcdd2" : "#e8f5e9", color: agency.status === "paused" ? "#b71c1c" : "#388e3c", fontWeight: 700, fontSize: 12, px: 1.2, borderRadius: 2 }}
          />
          {agency.phone && (
            <Typography fontSize={13} color="text.secondary">Tel: {agency.phone}</Typography>
          )}
          {agency.whatsapp && (
            <Typography fontSize={13} color="text.secondary">WhatsApp: {agency.whatsapp}</Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-end" }}>
        <Tooltip title="Editar" arrow>
          <IconButton aria-label="Editar" size="small" onClick={onEdit} sx={{ color: '#1976d2', bgcolor: '#e3f0fd', '&:hover': { bgcolor: '#bbdefb' } }}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={agency.status === "paused" ? "Reanudar" : "Pausar"} arrow>
          <IconButton
            aria-label={agency.status === "paused" ? "Reanudar" : "Pausar"}
            size="small"
            onClick={onTogglePause}
            sx={{ color: agency.status === 'paused' ? '#388e3c' : '#fbc02d', bgcolor: agency.status === 'paused' ? '#e8f5e9' : '#fffde7', '&:hover': { bgcolor: agency.status === 'paused' ? '#c8e6c9' : '#fff9c4' } }}
          >
            {agency.status === "paused" ? <PlayArrowIcon /> : <PauseIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar" arrow>
          <IconButton aria-label="Eliminar" size="small" onClick={onDelete} sx={{ color: '#d32f2f', bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
