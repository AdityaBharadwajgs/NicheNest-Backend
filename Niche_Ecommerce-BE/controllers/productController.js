const Product = require("../models/productModel");

// ===============================================
// ✅ Get All Products
// @route   GET /api/products
// ===============================================
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// ===============================================
// ✅ Search Products by Name or Category
// @route   GET /api/products/search?q=...
// ===============================================
const searchProducts = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({ message: "Search query cannot be empty" });
  }

  try {
    const results = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error searching products:", error.message);
    res.status(500).json({ message: "Error searching products" });
  }
};

module.exports = {
  getAllProducts,
  searchProducts,
};
