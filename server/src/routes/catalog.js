import { Router } from "express";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import { auth } from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/products", async (req, res) => {
  res.json(await Product.find({ owner: req.user._id }).sort({ name: 1 }));
});

router.post("/products", async (req, res) => {
  const product = await Product.create({ ...req.body, owner: req.user._id });
  res.status(201).json(product);
});

router.get("/customers", async (req, res) => {
  res.json(await Customer.find({ owner: req.user._id }).sort({ name: 1 }));
});

router.post("/customers", async (req, res) => {
  const customer = await Customer.create({ ...req.body, owner: req.user._id, balance: 0 });
  res.status(201).json(customer);
});

export default router;
