import mongoose, { Schema, models } from "mongoose";

const AgencySchema = new Schema(
  {
    name: { type: String },
    plan: {
      type: String,
      enum: ["free", "sponsor", "premium"],
      default: "free",
    },
    logo: { type: String }, // URL del logo
  },
  { timestamps: true }
);

export default models.Agency || mongoose.model("Agency", AgencySchema);

