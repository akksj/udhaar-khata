import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    shopName: { type: String, default: "Giri Kirana Store" },
    role: { type: String, enum: ["owner", "helper"], default: "owner" }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
