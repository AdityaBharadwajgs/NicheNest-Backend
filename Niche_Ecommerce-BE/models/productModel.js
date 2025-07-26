// models/productModel.js

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  description: String,
  price: { type: Number, required: true },
  image: String,
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: "Artisan" },
});

// ✅ Fix: Only compile model if it hasn't been compiled already
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
