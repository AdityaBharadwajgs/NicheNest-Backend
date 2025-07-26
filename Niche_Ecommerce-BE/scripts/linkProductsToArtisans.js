// scripts/linkProductsToArtisans.js
const mongoose = require("mongoose");
const Product = require("../models/productModel");
const Artisan = require("../models/Artisan");

const MONGO_URI = "mongodb://localhost:27017/desietsy";

async function linkProductsToArtisans() {
  try {
    await mongoose.connect(MONGO_URI);
    const artisans = await Artisan.find();
    const products = await Product.find();
    if (artisans.length === 0 || products.length === 0) {
      console.log("No artisans or products found.");
      process.exit();
    }

    // Assign each product to a random artisan
    for (const product of products) {
      const randomArtisan = artisans[Math.floor(Math.random() * artisans.length)];
      product.artisan = randomArtisan._id;
      await product.save();
    }

    // Clear all artisans' products arrays
    for (const artisan of artisans) {
      artisan.products = [];
    }

    // Re-populate artisans' products arrays
    const updatedProducts = await Product.find();
    for (const product of updatedProducts) {
      if (product.artisan) {
        const artisan = artisans.find(a => a._id.equals(product.artisan));
        if (artisan) {
          artisan.products.push(product._id);
        }
      }
    }

    // Save all artisans
    for (const artisan of artisans) {
      await artisan.save();
    }

    console.log("✅ Linked products to artisans successfully.");
    process.exit();
  } catch (error) {
    console.error("❌ Linking error:", error);
    process.exit(1);
  }
}

linkProductsToArtisans(); 