import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    sku: { type: String, default: "" },
    unit: { type: String, default: "pcs" },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 5 }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
