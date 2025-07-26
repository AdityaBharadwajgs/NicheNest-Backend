const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const { searchProducts } = require("../controllers/productController");

// GET /api/products - fetch all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/search - search products
router.get("/search", searchProducts);

// GET /api/products/:id - fetch single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products - add a new product
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
    res.status(500).json({ error: "Failed to add product" });
  }
});

// PUT /api/products/:id - update a product
router.put("/:id", async (req, res) => {
  try {
    const { name, price, stock, category, description, image } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, stock, category, description, image },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id - delete a product
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;