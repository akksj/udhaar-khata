import { Router } from "express";
import Bill from "../models/Bill.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import { auth } from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/dashboard", async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const bills = await Bill.find({ owner: req.user._id, createdAt: { $gte: start } });
  const customers = await Customer.find({ owner: req.user._id });
  const lowStock = await Product.find({ owner: req.user._id }).then((items) =>
    items.filter((item) => item.stock <= item.reorderLevel)
  );

  res.json({
    todaySales: bills.reduce((sum, bill) => sum + bill.paid, 0),
    todayBills: bills.length,
    outstanding: customers.reduce((sum, customer) => sum + customer.balance, 0),
    lowStock
  });
});

router.get("/bills", async (req, res) => {
  res.json(
    await Bill.find({ owner: req.user._id }).populate("customer", "name phone").sort({ createdAt: -1 }).limit(50)
  );
});

router.post("/bills", async (req, res) => {
  const { customerId, items = [], paid = 0, method = "cash" } = req.body;
  if (!items.length) return res.status(400).json({ message: "Add at least one item" });

  let total = 0;
  const normalized = [];

  for (const line of items) {
    const product = await Product.findOne({ _id: line.productId, owner: req.user._id });
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < line.qty) {
      return res.status(400).json({ message: `${product.name} has only ${product.stock} left` });
    }
    product.stock -= line.qty;
    await product.save();
    total += product.price * line.qty;
    normalized.push({ product: product._id, name: product.name, qty: line.qty, price: product.price });
  }

  const credit = Math.max(total - Number(paid), 0);
  let customer = null;
  if (customerId) {
    customer = await Customer.findOne({ _id: customerId, owner: req.user._id });
    if (customer && credit > 0) {
      customer.balance += credit;
      await customer.save();
    }
  }

  const bill = await Bill.create({
    owner: req.user._id,
    customer: customer?._id,
    items: normalized,
    total,
    paid: Number(paid),
    credit,
    method: credit > 0 && Number(paid) > 0 ? "mixed" : credit > 0 ? "udhaar" : method
  });

  res.status(201).json(bill);
});

router.post("/collect", async (req, res) => {
  const { customerId, amount } = req.body;
  const customer = await Customer.findOne({ _id: customerId, owner: req.user._id });
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  customer.balance = Math.max(customer.balance - Number(amount || 0), 0);
  await customer.save();
  res.json(customer);
});

export default router;
