// scripts/seedProducts.js
const mongoose = require("mongoose");
const Product = require("../models/productModel");

const products = [
  {
    name: "Handcrafted Terracotta Vase",
    category: "Home Decor",
    price: 499,
    description: "Beautiful terracotta vase handmade by artisans.",
    image: "https://i.ibb.co/xtxxjgt5/Terracotta-Vase.jpg",
    stock: 10,
  },
  {
    name: "Cotton Cushion Cover",
    category: "Textiles",
    price: 699,
    description: "Intricately embroidered cotton cushion cover.",
    image: "https://i.ibb.co/ZpmLrm4S/Cotton-Cushion-Cover.jpg",
    stock: 15,
  },
  {
    name: "Wooden Jewelry Box",
    category: "Accessories",
    price: 999,
    description: "Elegant handcrafted wooden jewelry box.",
    image: "https://i.ibb.co/v61Kp11j/Wooden-Jewelry-Box.jpg",
    stock: 8,
  },
  {
    name: "Woolen Shawl",
    category: "Clothing",
    price: 1499,
    description: "Cozy woolen shawl handwoven in Kashmir.",
    image: "https://i.ibb.co/TMx6Bk7N/Woolen-Shawl.jpg",
    stock: 12,
  },
  {
    name: "Brass Lamp",
    category: "Lighting",
    price: 799,
    description: "Traditional brass lamp for home décor.",
    image: "https://i.ibb.co/SXs7QMJ5/Brass-Lamp.jpg",
    stock: 20,
  },
  {
    name: "Block Print Fabric",
    category: "Textiles",
    price: 599,
    description: "Eco-friendly hand block printed fabric.",
    image: "https://i.ibb.co/zVFFK75w/Block-Print-Fabric.jpg",
    stock: 25,
  },
];

async function seedProducts() {
  try {
    await mongoose.connect("mongodb://localhost:27017/desietsy");
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log("✅ Seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedProducts();
