const Cart = require("../models/Cart");
const Product = require("../models/productModel");
const promoCodes = require("../data/promoCodes");

// 🚚 Get Cart Items by userId
exports.getCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) return res.status(200).json([]);
    // Flatten product info for frontend compatibility
    const items = cart.items.map(item => ({
      id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      shipping: item.product.shipping || "Free",
      estDelivery: item.product.estDelivery || "2–4 days",
      sku: item.product.sku || "",
      quantity: item.quantity
    }));
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart." });
  }
};

// ➕ Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { product } = req.body; // { id, ... }
    if (!product || !product.id) return res.status(400).json({ message: "Product info required." });
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    const existing = cart.items.find(item => item.product.toString() === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.items.push({ product: product.id, quantity: 1 });
    }
    await cart.save();
    return exports.getCart(req, res);
  } catch (err) {
    res.status(500).json({ message: "Failed to add to cart." });
  }
};

// 🗑️ Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const productId = req.params.productId;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found." });
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    return exports.getCart(req, res);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove from cart." });
  }
};

// 🔄 Update Quantity
exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found." });
    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: "Product not in cart." });
    item.quantity = Math.max(1, quantity);
    await cart.save();
    return exports.getCart(req, res);
  } catch (err) {
    res.status(500).json({ message: "Failed to update quantity." });
  }
};

// 💸 Apply Promo Code
exports.applyPromo = (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: "Promo code is required." });
  const found = Array.isArray(promoCodes)
    ? promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase())
    : null;
  const discount = found ? found.discount : 0;
  if (discount === 0) return res.status(400).json({ message: "❌ Invalid promo code." });
  res.status(200).json({ message: "✅ Promo code applied!", discount });
};

// 🧾 Checkout Summary
exports.checkout = async (req, res) => {
  try {
    const { userId, code } = req.body;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Cart not found." });
    const items = cart.items;
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = items.reduce((sum, item) => {
      const shippingVal = item.product.shipping === "Free" ? 0 : parseInt((item.product.shipping || "0").replace("₹", ""));
      return sum + (isNaN(shippingVal) ? 0 : shippingVal);
    }, 0);
    const discountRate = promoCodes[code?.toLowerCase()] || 0;
    const totalDiscount = subtotal * discountRate;
    const total = subtotal + shipping - totalDiscount;
    // Empty the cart after checkout
    cart.items = [];
    await cart.save();
    res.status(200).json({
      message: "✅ Checkout summary generated!",
      subtotal,
      shipping,
      discount: totalDiscount,
      total,
    });
  } catch (err) {
    res.status(500).json({ message: "Checkout failed." });
  }
};
