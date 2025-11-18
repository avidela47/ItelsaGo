import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  listing: mongoose.Types.ObjectId; // Referencia a Listing
  agency: mongoose.Types.ObjectId; // Referencia a Agency
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Date;
  status?: "pending" | "contacted" | "closed"; // Estado del contacto
}

const ContactSchema = new Schema<IContact>(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    agency: { type: Schema.Types.ObjectId, ref: "Agency", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "contacted", "closed"], default: "pending" },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// Índices para mejorar queries
ContactSchema.index({ agency: 1, createdAt: -1 }); // Para buscar por agencia ordenado por fecha
ContactSchema.index({ listing: 1, createdAt: -1 }); // Para buscar por propiedad

const Contact = mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
