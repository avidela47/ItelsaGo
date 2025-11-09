import mongoose, { Schema, models } from "mongoose";

const ListingSchema = new Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "ARS" },
    rooms: { type: Number, default: 0 },
    description: { type: String, default: "" },

    propertyType: {
      type: String,
      enum: ["depto", "casa", "lote", "local"],
      required: true,
    },
    operationType: {
      type: String,
      enum: ["venta", "alquiler", "temporario"],
      required: true,
    },

    images: { type: [String], default: [] },

    agency: {
      name: { type: String, default: "" },
      logo: { type: String, default: "" },
      plan: {
        type: String,
        enum: ["free", "sponsor", "premium"],
        default: "free",
      },
    },

    // ✅ idempotencia: una key única por intento de creación
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// índices útiles para buscar duplicados “por contenido”
ListingSchema.index({
  title: 1,
  location: 1,
  price: 1,
  currency: 1,
  propertyType: 1,
  operationType: 1,
});

export default models.Listing || mongoose.model("Listing", ListingSchema);




