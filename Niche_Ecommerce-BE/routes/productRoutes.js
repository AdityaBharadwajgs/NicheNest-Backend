const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const { getAllProducts, searchProducts } = require("../controllers/productController");

// ================================
// ✅ GET: All Products
// ================================
router.get("/", getAllProducts); // GET /api/products

// ================================
// ✅ GET: Search Products
// ================================
router.get("/search", searchProducts); // GET /api/products/search

// ✅ POST: Add a new product
router.post("/", async (req, res) => {
  try {
    const { name, price, stock, category, description, image } = req.body;
    if (!name || !price || !stock || !category || !description || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const newProduct = new Product({ name, price, stock, category, description, image });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("❌ Error adding product:", err.message);
    res.status(500).json({ error: "Failed to add product" });
  }
});

module.exports = router;