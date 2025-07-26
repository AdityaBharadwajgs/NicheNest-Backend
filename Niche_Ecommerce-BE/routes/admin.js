import express from "express";
import Product from "../models/productModel.js";
import Artisan from "../models/Artisan.js";
import Order from "../models/Order.js";
import User from "../models/userModel.js";

const router = express.Router();

// === PRODUCTS ===
router.get("/products", async (req, res) => {
  const products = await Product.find().populate("artisan");
  res.json(products);
});

router.post("/products", async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.status(201).json(newProduct);
});

router.put("/products/:id", async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

// === ARTISANS ===
router.get("/artisans", async (req, res) => {
  const artisans = await Artisan.find();
  res.json(artisans);
});

router.get("/artisans/:id", async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);
    if (!artisan) return res.status(404).json({ message: "Artisan not found" });
    res.json(artisan);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/artisans", async (req, res) => {
  const newArtisan = new Artisan(req.body);
  await newArtisan.save();
  res.status(201).json(newArtisan);
});

router.put("/artisans/:id", async (req, res) => {
  const updated = await Artisan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/artisans/:id", async (req, res) => {
  await Artisan.findByIdAndDelete(req.params.id);
  res.json({ message: "Artisan deleted" });
});

// === ORDERS ===
router.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

router.put("/orders/:id", async (req, res) => {
  const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// === USERS ===
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

export default router;
