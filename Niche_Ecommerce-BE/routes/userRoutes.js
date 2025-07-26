const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const User = require("../models/userModel");
const Order = require("../models/Order");
const Product = require("../models/productModel");

// ==============================
// GET: User Profile
// ==============================
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("wishlist");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// ==============================
// PUT: Update Profile Info
// ==============================
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, city, avatar } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.city = city || user.city;
    user.avatar = avatar || user.avatar;

    user.activity.unshift({ action: "Updated profile info", date: new Date() });

    await user.save();
    const updatedUser = await User.findById(req.params.id).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Update failed:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ==============================
// PUT: Change Password
// ==============================
router.put("/:id/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    user.activity.unshift({ action: "Updated password", date: new Date() });
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch {
    res.status(500).json({ error: "Error updating password" });
  }
});

// ==============================
// GET: All Addresses
// ==============================
router.get("/:id/addresses", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.addresses || []);
  } catch {
    res.status(500).json({ error: "Could not fetch addresses" });
  }
});

// ==============================
// POST: Add New Address
// ==============================
router.post("/:id/addresses", async (req, res) => {
  const { street, city, state, country } = req.body;

  if (!street || !city || !state || !country) {
    return res.status(400).json({ error: "All address fields are required" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.addresses.push({ street, city, state, country });
    user.activity.unshift({ action: "Added a new address", date: new Date() });

    await user.save();

    res.json(user.addresses);
  } catch {
    res.status(500).json({ error: "Failed to add address" });
  }
});

// ==============================
// GET: Wishlist
// ==============================
router.get("/:id/wishlist", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("wishlist");
    if (!user) return res.status(404).json({ error: "User not found" });

    const wishlist = user.wishlist.map((product) => ({ product }));
    res.json(wishlist);
  } catch {
    res.status(500).json({ error: "Could not fetch wishlist" });
  }
});

// ==============================
// POST: Move Wishlist Item to Orders
// ==============================
router.post("/:id/wishlist/move-to-order/:productId", async (req, res) => {
  try {
    const userId = req.params.id;
    const productId = req.params.productId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Remove from wishlist
    user.wishlist.pull(productId);

    // Determine shipping address
    const shippingAddress =
      user.addresses && user.addresses.length > 0
        ? `${user.addresses[0].street}, ${user.addresses[0].city}`
        : "Default Address";

    // Create new order
    const order = new Order({
      user: user._id,
      items: [{ product: product._id, quantity: 1 }],
      totalAmount: product.price,
      shippingAddress,
    });

    await order.save();

    user.activity.unshift({
      action: `Placed order for ${product.name}`,
      date: new Date(),
    });

    await user.save();

    const updatedUser = await User.findById(userId).populate("wishlist");
    const orders = await Order.find({ user: userId }).populate("items.product");

    res.json({
      wishlist: updatedUser.wishlist.map((product) => ({ product })),
      orders,
    });
  } catch {
    res.status(500).json({ error: "Failed to move item to orders" });
  }
});

// ==============================
// GET: Orders
// ==============================
router.get("/:id/orders", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id }).populate("items.product");
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ==============================
// GET: Activity Log
// ==============================
router.get("/:id/activity", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.activity || []);
  } catch {
    res.status(500).json({ error: "Failed to fetch activity log" });
  }
});




module.exports = router;
