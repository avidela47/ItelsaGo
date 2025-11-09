import { Schema, model, models } from "mongoose";

const ListingSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 1 },
  currency: { type: String, required: true, uppercase: true, trim: true },
  location: { type: String, required: true, trim: true },
  rooms: { type: Number, default: 0, min: 0 },
  propertyType: { type: String, required: true, enum: ["depto","casa","lote","local"] },
  operationType: { type: String, required: true, enum: ["venta","alquiler","temporario"] },
  images: { type: [String], default: [] },
  agencyId: { type: Schema.Types.ObjectId, ref: "Agency", default: null }
}, { timestamps: true });

export default models.Listing || model("Listing", ListingSchema);



