import { models, model, Schema } from "mongoose";
const ProductSchema = new Schema({
  title: String,
  category: String,
  price: Number,
  currency: String,
}, { timestamps: true });

export default models.Product || model("Product", ProductSchema);
