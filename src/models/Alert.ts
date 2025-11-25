import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAlert extends Document {
  user: mongoose.Types.ObjectId;
  criteria: Record<string, any>; // Filtros de búsqueda guardados
  active: boolean;
  lastNotifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    criteria: { type: Schema.Types.Mixed, required: true },
    active: { type: Boolean, default: true },
    lastNotifiedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Alert) {
  delete mongoose.models.Alert;
}

const Alert: Model<IAlert> = mongoose.model<IAlert>("Alert", AlertSchema);

export default Alert;
