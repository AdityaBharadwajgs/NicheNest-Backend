// routes/api.js

const express = require("express");
const router = express.Router();

const Product = require("../models/productModel");
const Artisan = require("../models/Artisan");
const User = require("../models/userModel");

// ================================
// @route   GET /api/products
// @desc    Fetch all products
// ================================
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ error: "Server error while fetching products." });
  }
});

// ================================
// @route   GET /api/artisans
// @desc    Fetch all artisans
// ================================
router.get("/artisans", async (req, res) => {
  try {
    const artisans = await Artisan.find();
    res.status(200).json(artisans);
  } catch (err) {
    console.error("Error fetching artisans:", err.message);
    res.status(500).json({ error: "Server error while fetching artisans." });
  }
});

// ================================
// @route   GET /api/users
// @desc    Fetch all users (excluding passwords)
// ================================
router.get("/users", async (req, res) => {
  try {
    console.log("📥 GET /api/users called");
    const users = await User.find().select("-password");
    console.log("📤 Users fetched:", users.length);
    res.status(200).json(users);
  } catch (err) {
    console.error("❗ Failed to fetch users route:", err);
    res.status(500).json({ error: "Server error (see console)" });
  }
});

module.exports = router;
