const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const Order = require("../models/Order");
const Product = require("../models/productModel");

// GET /api/users - fetch all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("Fetch users error:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /api/users/:id - fetch single user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Clean up wishlist by removing null values
    if (user.wishlist && user.wishlist.length > 0) {
      const originalLength = user.wishlist.length;
      user.wishlist = user.wishlist.filter(id => id !== null && id !== undefined);
      if (user.wishlist.length !== originalLength) {
        console.log(`Cleaned up wishlist: removed ${originalLength - user.wishlist.length} null values`);
        await user.save();
      }
    }
    
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err.message);
    res.status(500).json({ error: "Failed to get user details" });
  }
});

// PUT /api/users/:id - update profile info
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, city, avatar } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.fullName = name || user.fullName;
    user.email = email || user.email;
    user.mobileNumber = phone || user.mobileNumber;
    user.city = city || user.city;
    user.avatar = avatar || user.avatar;

    user.activity.unshift({ action: "Updated profile info", date: new Date() });
    await user.save();

    const updatedUser = await User.findById(req.params.id).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// PUT /api/users/:id/password - change password
router.put("/:id/password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.activity.unshift({ action: "Updated password", date: new Date() });

    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err.message);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// POST /api/users/:id/addresses - add address
router.post("/:id/addresses", async (req, res) => {
  try {
    const { street, city, state, country, pincode, type } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.addresses.push({ street, city, state, country, pincode, type });
    user.activity.unshift({ action: "Added a new address", date: new Date() });

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    console.error("Add address error:", err.message);
    res.status(500).json({ error: "Failed to add address" });
  }
});

// PUT /api/users/:id/addresses/:addressId - update address
router.put("/:id/addresses/:addressId", async (req, res) => {
  try {
    const { street, city, state, country, pincode, type } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ error: "Address not found" });

    address.set({ street, city, state, country, pincode, type });
    user.activity.unshift({ action: "Updated an address", date: new Date() });

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    console.error("Update address error:", err.message);
    res.status(500).json({ error: "Failed to update address" });
  }
});

// DELETE /api/users/:id/addresses/:addressId - delete address
router.delete("/:id/addresses/:addressId", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
    user.activity.unshift({ action: "Deleted an address", date: new Date() });

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    console.error("Delete address error:", err.message);
    res.status(500).json({ error: "Failed to delete address" });
  }
});

// POST /api/users/:id/wishlist - add to wishlist
router.post("/:id/wishlist", async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      user.activity.unshift({ action: "Added item to wishlist", date: new Date() });
    }

    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    console.error("Add to wishlist error:", err.message);
    res.status(500).json({ error: "Failed to update wishlist" });
  }
});

// DELETE /api/users/:id/wishlist - remove from wishlist
router.delete("/:id/wishlist", async (req, res) => {
  try {
    console.log("Removing from wishlist - User ID:", req.params.id);
    console.log("Request body:", req.body);
    
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    console.log("User found, current wishlist:", user.wishlist);
    console.log("Product ID to remove:", productId);
    console.log("Product ID type:", typeof productId);
    
    // Convert all wishlist IDs to strings for comparison, filtering out null values
    const wishlistIds = user.wishlist
      .filter(id => id !== null && id !== undefined)
      .map(id => id.toString());
    console.log("Wishlist IDs as strings:", wishlistIds);
    
    user.wishlist = user.wishlist.filter((id) => id !== null && id !== undefined && id.toString() !== productId);
    console.log("Updated wishlist:", user.wishlist);
    
    user.activity.unshift({ action: "Removed item from wishlist", date: new Date() });

    await user.save();
    console.log("User saved successfully");
    
    // Return updated wishlist with populated products, filtering out null values
    const updatedUser = await User.findById(req.params.id).populate({
      path: "wishlist",
      model: "Product",
    });
    const wishlist = updatedUser.wishlist
      .filter(product => product !== null && product !== undefined)
      .map((product) => ({ product }));
    console.log("Returning wishlist:", wishlist);
    res.json(wishlist);
  } catch (err) {
    console.error("Remove from wishlist error:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Full error object:", err);
    res.status(500).json({ error: "Failed to remove from wishlist", details: err.message });
  }
});

// POST /api/users/:id/orders - move item from wishlist to orders
router.post("/:id/orders", async (req, res) => {
  try {
    console.log("Moving to orders - User ID:", req.params.id);
    console.log("Request body:", req.body);
    
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Find the product
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    console.log("Product found:", product.name);

    // Create a new order
    const newOrder = new Order({
      user: user._id,
      items: [{ product: productId, quantity: 1 }],
      totalAmount: product.price,
      shippingAddress: user.addresses && user.addresses.length > 0 
        ? `${user.addresses[0].street}, ${user.addresses[0].city}` 
        : "Default Address",
      status: "Pending",
      paymentStatus: "Unpaid"
    });

    console.log("Creating new order:", newOrder);
    await newOrder.save();
    console.log("Order saved successfully:", newOrder._id);
    
    // Verify the order was saved
    const savedOrder = await Order.findById(newOrder._id).populate("user", "fullName email");
    console.log("Verified saved order:", savedOrder);

    // Remove from wishlist, filtering out null values
    user.wishlist = user.wishlist.filter((id) => id !== null && id !== undefined && id.toString() !== productId);
    user.activity.unshift({ action: `Moved ${product.name} to orders`, date: new Date() });

    await user.save();
    console.log("User updated successfully");

    // Return updated wishlist and orders, filtering out null values
    const updatedUser = await User.findById(req.params.id).populate({
      path: "wishlist",
      model: "Product",
    });
    const wishlist = updatedUser.wishlist
      .filter(product => product !== null && product !== undefined)
      .map((product) => ({ product }));
    
    const orders = await Order.find({ user: req.params.id })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .sort({ createdAt: -1 });

    console.log("Returning response with wishlist and orders");
    res.json({ wishlist, orders });
  } catch (err) {
    console.error("Move to orders error:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Full error object:", err);
    res.status(500).json({ error: "Failed to move to orders", details: err.message });
  }
});

// GET /api/users/:id/orders - get user's orders
router.get("/:id/orders", async (req, res) => {
  try {
    // Find all orders for this user
    const orders = await Order.find({ user: req.params.id })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Get user orders error:", err.message);
    res.status(500).json({ error: "Failed to get user orders" });
  }
});

// GET /api/users/:id/wishlist - get user's wishlist (populated)
router.get("/:id/wishlist", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: "wishlist",
      model: "Product",
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    // Return as array of { product: ... } for frontend compatibility, filtering out null values
    const wishlist = user.wishlist
      .filter(product => product !== null && product !== undefined)
      .map((product) => ({ product }));
    res.json(wishlist);
  } catch (err) {
    console.error("Get wishlist error:", err.message);
    res.status(500).json({ error: "Failed to get wishlist" });
  }
});

// GET /api/users/:id/addresses - get user's addresses
router.get("/:id/addresses", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.addresses || []);
  } catch (err) {
    console.error("Get addresses error:", err.message);
    res.status(500).json({ error: "Failed to get addresses" });
  }
});

// GET /api/users/:id/activity - get user's activity log
router.get("/:id/activity", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.activity || []);
  } catch (err) {
    console.error("Get activity error:", err.message);
    res.status(500).json({ error: "Failed to get activity log" });
  }
});

module.exports = router;