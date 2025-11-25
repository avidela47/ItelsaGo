import mongoose, { Schema, models } from "mongoose";

const AgencySchema = new Schema(
  {
    name: { type: String },
    plan: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },
    logo: { type: String }, // URL del logo
    email: { type: String }, // Email de contacto
    phone: { type: String }, // Teléfono
    whatsapp: { type: String }, // WhatsApp
    status: { type: String, enum: ["active", "paused"], default: "active" },
  },
  { timestamps: true }
);

export default models.Agency || mongoose.model("Agency", AgencySchema);

