import mongoose, { Schema, model, models } from "mongoose";

export interface IAgency {
  name: string;
  email?: string;
  passwordHash?: string;
  logoUrl?: string;
  phone?: string;
  contactEmail?: string;
  plan?: string; // free | basic | premium
  featuredUntil?: Date | null;
  role?: string; // agency | admin
  createdAt?: Date;
}

const AgencySchema = new Schema<IAgency>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: false, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: false },
    logoUrl: { type: String, default: "" },
    phone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    plan: { type: String, default: "free" },
    featuredUntil: { type: Date, default: null },
    role: { type: String, default: "agency" }
  },
  { timestamps: true }
);

const Agency = models.Agency || model<IAgency>("Agency", AgencySchema);
export default Agency;
