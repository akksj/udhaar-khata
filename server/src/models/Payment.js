import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["cash", "upi"], default: "cash" }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
