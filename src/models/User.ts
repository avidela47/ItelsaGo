import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "user" | "agency" | "admin";

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
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


