import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "user" | "inmobiliaria" | "admin";

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
      enum: ["user", "inmobiliaria", "admin"],
      default: "user", // 👈 todos los registros nuevos entran como user
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;


