import { Router } from "express";
import Bill from "../models/Bill.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
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
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: "Add at least one item" });
  }

  const paidAmount = Number(paid);
  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    return res.status(400).json({ message: "Paid amount must be zero or more" });
  }

  const saved = [];
  let total = 0;
  const normalized = [];

  try {
    for (const line of items) {
      const qty = Number(line.qty);
      if (!Number.isInteger(qty) || qty < 1) {
        throw Object.assign(new Error("Quantity must be a whole number above zero"), { status: 400 });
      }

      const product = await Product.findOne({ _id: line.productId, owner: req.user._id });
      if (!product) throw Object.assign(new Error("Product not found"), { status: 404 });
      if (product.stock < qty) {
        throw Object.assign(new Error(`${product.name} has only ${product.stock} left`), { status: 400 });
      }
      product.stock -= qty;
      await product.save();
      saved.push({ product, qty });
      total += product.price * qty;
      normalized.push({ product: product._id, name: product.name, qty, price: product.price });
    }

    const credit = Math.max(total - paidAmount, 0);
    let customer = null;
    if (credit > 0 && !customerId) {
      throw Object.assign(new Error("Select a customer before putting a bill on udhaar"), { status: 400 });
    }
    if (customerId) {
      customer = await Customer.findOne({ _id: customerId, owner: req.user._id });
      if (!customer) throw Object.assign(new Error("Customer not found"), { status: 404 });
      if (credit > 0) {
        customer.balance += credit;
        await customer.save();
      }
    }

    const bill = await Bill.create({
      owner: req.user._id,
      customer: customer?._id,
      items: normalized,
      total,
      paid: paidAmount,
      credit,
      method: credit > 0 && paidAmount > 0 ? "mixed" : credit > 0 ? "udhaar" : method
    });

    res.status(201).json(bill);
  } catch (error) {
    await Promise.all(saved.map(({ product, qty }) => {
      product.stock += qty;
      return product.save();
    }));
    if (error.status) return res.status(error.status).json({ message: error.message });
    throw error;
  }
});

router.get("/payments", async (req, res) => {
  const payments = await Payment.find({ owner: req.user._id })
    .populate("customer", "name")
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(payments);
});

router.post("/collect", async (req, res) => {
  const amount = Number(req.body.amount);
  const method = req.body.method === "upi" ? "upi" : "cash";
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than zero" });
  }
  const customer = await Customer.findOne({ _id: req.body.customerId, owner: req.user._id });
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  if (amount > customer.balance) {
    return res.status(400).json({ message: `Customer owes only ₹${customer.balance}` });
  }
  customer.balance -= amount;
  await customer.save();
  const payment = await Payment.create({
    owner: req.user._id,
    customer: customer._id,
    amount,
    method
  });
  res.status(201).json({ customer, payment });
});

export default router;
