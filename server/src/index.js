import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import catalogRoutes from "./routes/catalog.js";
import billingRoutes from "./routes/billing.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5174" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "udhaar-khata" }));
app.use("/api/auth", authRoutes);
app.use("/api", catalogRoutes);
app.use("/api", billingRoutes);

const port = Number(process.env.PORT || 5001);
connectDb(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`Udhaar Khata API on :${port}`)))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
