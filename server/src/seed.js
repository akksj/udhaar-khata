import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDb } from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Customer from "./models/Customer.js";

async function seed() {
  await connectDb(process.env.MONGO_URI);
  const owner = await User.findOneAndUpdate(
    { email: "owner@khata.local" },
    {
      name: "Sarthak",
      email: "owner@khata.local",
      shopName: "Giri Kirana Store",
      passwordHash: await bcrypt.hash("Password123", 10),
      role: "owner"
    },
    { upsert: true, new: true }
  );

  const products = [
    { name: "Aashirvaad Atta 5kg", price: 275, stock: 18, reorderLevel: 5, unit: "bag" },
    { name: "Tata Salt 1kg", price: 28, stock: 40, reorderLevel: 10, unit: "pkt" },
    { name: "Fortune Oil 1L", price: 145, stock: 4, reorderLevel: 6, unit: "btl" },
    { name: "Parle-G 800g", price: 55, stock: 22, reorderLevel: 8, unit: "pkt" }
  ];

  for (const product of products) {
    await Product.findOneAndUpdate(
      { owner: owner._id, name: product.name },
      { ...product, owner: owner._id },
      { upsert: true }
    );
  }

  await Customer.findOneAndUpdate(
    { owner: owner._id, phone: "9876543210" },
    { owner: owner._id, name: "Mrs. Joshi", phone: "9876543210", address: "Lane 4", balance: 430 },
    { upsert: true }
  );

  console.log("Seed complete: owner@khata.local / Password123");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
