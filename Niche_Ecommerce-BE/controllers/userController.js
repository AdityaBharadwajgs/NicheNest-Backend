const User = require("../models/userModel");
const Order = require("../models/Order");
const Product = require("../models/productModel");
const bcrypt = require("bcrypt");

// ✅ GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ✅ ADD NEW USER
exports.addUserDetails = async (req, res) => {
  try {
    const { name, email, phone, avatar, city, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "Name, email, phone, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      avatar: avatar || "",
      city: city || "",
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("❌ Error adding user:", err.message);
    res.status(500).json({ error: "Failed to add user" });
  }
};

// ✅ GET USER PROFILE
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error fetching user profile:", err.message);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

// ✅ UPDATE USER PROFILE
exports.updateUserProfile = async (req, res) => {
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
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("❌ Error updating user:", err.message);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};

// ✅ UPDATE PASSWORD
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new passwords are required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.activity.unshift({ action: "Changed password", date: new Date() });

    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error updating password:", err.message);
    res.status(500).json({ error: "Failed to update password" });
  }
};

// ✅ GET USER ORDERS
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id }).populate("items.product").sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// ✅ GET USER WISHLIST
exports.getUserWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("wishlist");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user.wishlist || []);
  } catch (err) {
    console.error("❌ Error fetching wishlist:", err.message);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
};

// ✅ MOVE WISHLIST ITEM TO ORDER
exports.moveToOrderFromWishlist = async (req, res) => {
  try {
    const { id, productId } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    user.wishlist.pull(productId);

    const newOrder = new Order({
      user: id,
      items: [{ product: productId, quantity: 1 }],
      totalAmount: product.price,
      shippingAddress: user.addresses?.[0] || "Default Address",
    });

    await newOrder.save();
    user.activity.unshift({ action: `Ordered: ${product.name}`, date: new Date() });

    await user.save();

    const updatedUser = await User.findById(id).populate("wishlist");
    const updatedOrders = await Order.find({ user: id }).populate("items.product");

    res.status(200).json({ wishlist: updatedUser.wishlist, orders: updatedOrders });
  } catch (err) {
    console.error("❌ Error moving to order:", err.message);
    res.status(500).json({ error: "Failed to move product to order" });
  }
};

// ✅ ADD ADDRESS (No pincode, type)
exports.addUserAddress = async (req, res) => {
  try {
    const { street, city, state, country } = req.body;

    if (!street || !city || !state || !country) {
      return res.status(400).json({ error: "All address fields are required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const newAddress = { street, city, state, country };
    user.addresses.push(newAddress);

    user.activity.unshift({ action: "Added a new address", date: new Date() });

    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    console.error("❌ Error adding address:", err.message);
    res.status(500).json({ error: "Failed to add address" });
  }
};

// ✅ GET USER ADDRESSES
exports.getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user.addresses || []);
  } catch (err) {
    console.error("❌ Error fetching addresses:", err.message);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};

// ✅ GET USER ACTIVITY LOG
exports.getActivityLog = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("activity");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user.activity || []);
  } catch (err) {
    console.error("❌ Error fetching activity:", err.message);
    res.status(500).json({ error: "Failed to fetch activity log" });
  }
};

