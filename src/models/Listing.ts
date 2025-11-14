import mongoose, { Schema, models, model } from "mongoose";

const ListingSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    currency: { type: String, enum: ["ARS", "USD"], required: true },
    rooms: { type: Number, default: 0 },
    propertyType: { type: String, enum: ["depto", "casa", "lote", "local"], default: "depto" },
    operationType: { type: String, enum: ["venta", "alquiler", "temporario"], default: "venta" },
    images: { type: [String], default: [] },
    description: { type: String, default: "" },
    agency: { type: Schema.Types.ObjectId, ref: "Agency" }, // Referencia a la colección Agency
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export type TListing = mongoose.InferSchemaType<typeof ListingSchema>;
const Listing = models.Listing || model("Listing", ListingSchema);
export default Listing;



