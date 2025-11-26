import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "user" | "agency" | "admin";
export type SubscriptionPlan = "free" | "pro" | "premium";

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  role: UserRole;
  plan?: SubscriptionPlan;
  subscriptionDate?: Date;
  favoriteListings?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "agency", "admin"],
      default: "user",
    },
    plan: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },
    subscriptionDate: { type: Date },
  favoriteListings: [{ type: Schema.Types.ObjectId, ref: "Listing" }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Eliminar modelo cacheado si existe para forzar actualización del schema
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;


