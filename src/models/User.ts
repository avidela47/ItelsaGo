import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, index: true },
    password: { type: String }, // hashed
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", UserSchema);
export default User;
