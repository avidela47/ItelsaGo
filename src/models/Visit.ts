import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisit extends Document {
  listing: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  date: Date;
  referrer?: string;
}

const VisitSchema = new Schema<IVisit>({
  listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
  referrer: { type: String },
});

if (mongoose.models.Visit) {
  delete mongoose.models.Visit;
}

const Visit: Model<IVisit> = mongoose.model<IVisit>("Visit", VisitSchema);

export default Visit;
