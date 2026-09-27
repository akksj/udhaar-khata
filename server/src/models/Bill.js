import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        qty: Number,
        price: Number
      }
    ],
    total: { type: Number, required: true },
    paid: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    method: { type: String, enum: ["cash", "upi", "mixed", "udhaar"], default: "cash" }
  },
  { timestamps: true }
);

export default mongoose.model("Bill", billSchema);
