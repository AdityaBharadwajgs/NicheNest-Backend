const express = require("express");
const router = express.Router();

// 📦 Import controller functions
const {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  applyPromo,
  checkout,
} = require("../controllers/cartController");

// All routes now use the persistent Mongoose Cart model

/**
 * @route   GET /api/cart/:userId
 * @desc    Get all cart items for a specific user
 * @access  Public (you can secure it later with authentication)
 */
router.get("/:userId", getCart);

/**
 * @route   POST /api/cart/:userId/add
 * @desc    Add a product to the cart
 * @access  Public
 */
router.post("/:userId/add", addToCart);

/**
 * @route   DELETE /api/cart/:userId/remove/:productId
 * @desc    Remove a product from the cart
 * @access  Public
 */
router.delete("/:userId/remove/:productId", removeFromCart);

/**
 * @route   PUT /api/cart/:userId/update
 * @desc    Update the quantity of a product in the cart
 * @access  Public
 */
router.put("/:userId/update", updateQuantity);

/**
 * @route   POST /api/cart/apply
 * @desc    Apply a promo code and return discount
 * @access  Public
 */
router.post("/apply", applyPromo);

/**
 * @route   POST /api/cart/checkout
 * @desc    Calculate final order total with discount and shipping
 * @access  Public
 */
router.post("/checkout", checkout);

module.exports = router;
