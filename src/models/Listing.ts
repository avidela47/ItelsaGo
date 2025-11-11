import mongoose, { Schema, Model } from "mongoose";

type AgencyPlan = "premium" | "sponsor" | "free";

export interface IListing {
  title: string;
  location: string;
  price: number;
  currency: "ARS" | "USD";
  rooms?: number;
  propertyType: "depto" | "casa" | "lote" | "local";
  operationType: "venta" | "alquiler" | "temporario";
  images: string[];
  description?: string;
  agency?: {
    logo?: string;
    plan: AgencyPlan;
  };
  createdAt?: Date;
  updatedAt?: Date;
  idempotencyKey?: string; // para evitar duplicados al crear
}

const AgencySchema = new Schema(
  {
    logo: { type: String },
    plan: {
      type: String,
      enum: ["premium", "sponsor", "free"],
      default: "free",
      index: true,
    },
  },
  { _id: false }
);

const ListingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true },
    location: { type: String, required: true, index: true },
    price: { type: Number, required: true, index: true },
    currency: { type: String, enum: ["ARS", "USD"], required: true },
    rooms: { type: Number, default: 0 },
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
    description: { type: String },
    agency: { type: AgencySchema, default: undefined },
    idempotencyKey: { type: String, index: true, unique: true, sparse: true },
  },
  { timestamps: true }
);

// índices útiles
ListingSchema.index({ createdAt: -1 });

export const Listing: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);

export default Listing;



