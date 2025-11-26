import mongoose, { Schema, models } from "mongoose";

const AgencySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    plan: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },
    logo: { type: String }, // URL del logo
    email: { type: String, required: true, unique: true, trim: true, lowercase: true }, // Email de contacto
    phone: { type: String }, // Teléfono
    whatsapp: { type: String }, // WhatsApp
    status: { type: String, enum: ["active", "paused"], default: "active" },
  },
  { timestamps: true }
);

export default models.Agency || mongoose.model("Agency", AgencySchema);

