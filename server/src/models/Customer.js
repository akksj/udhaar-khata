import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    balance: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
