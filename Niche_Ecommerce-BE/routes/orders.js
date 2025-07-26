const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const { sendEmail } = require("../utils/sendEmail");

// ==============================
// ✅ GET: Admin - All Orders
// ==============================
router.get("/", async (req, res) => {
  try {
    console.log("Admin requesting all orders...");
    
    // First check total count without population
    const totalCount = await Order.countDocuments();
    console.log("Total orders in database:", totalCount);
    
    const orders = await Order.find()
      .populate("user", "fullName email")
      .populate("items.product");
    console.log("Admin fetching orders, count:", orders.length);
    console.log("Raw orders data:", orders);
    console.log("Orders summary:", orders.map(o => ({ 
      id: o._id, 
      user: o.user?.fullName || o.user?.name, 
      userData: o.user,
      total: o.totalAmount,
      createdAt: o.createdAt 
    })));
    console.log("Sending orders response:", orders);
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err.message);
    res.status(500).json({ error: "Failed to fetch all orders" });
  }
});

// ==============================
// ✅ GET: Orders by User ID
// ==============================
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err.message);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
});

// ==============================
// ✅ POST: Create a New Order
// ==============================
router.post("/", async (req, res) => {
  const {
    userId,
    items, // [{ product, quantity }]
    shippingAddress,
    paymentStatus = "Unpaid",
    status = "Pending", // ✅ default status
    trackingId,
    deliveryDate,
    invoiceGenerated = false,
  } = req.body;

  try {
    if (!userId || !shippingAddress || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.product}` });
      }
      totalAmount += product.price * (item.quantity || 1);
    }

    const newOrder = new Order({
      user: userId,
      items,
      totalAmount,
      shippingAddress,
      paymentStatus,
      status,
      trackingId,
      deliveryDate,
      invoiceGenerated,
    });

    await newOrder.save();

    // Decrement stock for each product in the order
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    // Log to user activity
    const user = await User.findById(userId);
    if (user) {
      user.activity.unshift({
        action: `Placed an order (${newOrder._id})`,
        date: new Date(),
      });
      await user.save();
      // Send order confirmation email asynchronously
      sendEmail(
        user.email,
        "Order Confirmation - NicheNest",
        `Thank you for your order!\n\nOrder ID: ${newOrder._id}\nTotal Amount: ₹${newOrder.totalAmount}\nStatus: ${newOrder.status}\n\nWe appreciate your purchase!\n\nNicheNest Team`
      ).then(() => {
        console.log('Order confirmation email sent (async)');
      }).catch((e) => {
        console.error("Failed to send order confirmation email (async):", e.message);
      });
    }

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    console.error("Error placing order:", err.message);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// ==============================
// ✅ PUT: Update Order Status
// ==============================
router.put("/:orderId/status", async (req, res) => {
  const { status, trackingId, deliveryDate, invoiceGenerated } = req.body;

  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (status) order.status = status;
    if (trackingId !== undefined) order.trackingId = trackingId;
    if (deliveryDate) order.deliveryDate = new Date(deliveryDate);
    if (typeof invoiceGenerated === "boolean") {
      order.invoiceGenerated = invoiceGenerated;
    }

    await order.save();
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (err) {
    console.error("Error updating order:", err.message);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// ==============================
// ✅ DELETE: Remove an Order
// ==============================
router.delete("/:orderId", async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.orderId);
    if (!deleted) return res.status(404).json({ error: "Order not found" });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err.message);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// ==============================
// ✅ GET: Download Invoice PDF
// ==============================
router.get("/:orderId/invoice", async (req, res) => {
  try {
    console.log("Generating invoice for order:", req.params.orderId);
    
    const order = await Order.findById(req.params.orderId)
      .populate("user", "fullName email mobileNumber")
      .populate("items.product", "name price");

    console.log("Order found:", order ? "Yes" : "No");
    
    if (!order) {
      console.log("Order not found for ID:", req.params.orderId);
      return res.status(404).json({ error: "Order not found" });
    }

    console.log("Order data:", {
      id: order._id,
      user: order.user,
      items: order.items?.length,
      totalAmount: order.totalAmount
    });

    // Generate simple HTML invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Order ${order._id.toString().slice(-8)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 30px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; font-size: 18px; }
          .footer { margin-top: 50px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>NicheNest - Handcrafted Products</h2>
        </div>
        
        <div class="invoice-details">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${order._id.toString()}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${order.status || 'Pending'}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus || 'Unpaid'}</p>
          ${order.trackingId ? `<p><strong>Tracking ID:</strong> ${order.trackingId}</p>` : ''}
        </div>
        
        <div class="customer-details">
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> ${order.user?.fullName || order.user?.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${order.user?.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${order.user?.mobileNumber || order.user?.phone || 'N/A'}</p>
          <p><strong>Shipping Address:</strong> ${order.shippingAddress || 'Default Address'}</p>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map(item => `
              <tr>
                <td>${item.product?.name || 'Product'}</td>
                <td>${item.quantity || 1}</td>
                <td>₹${item.product?.price || 0}</td>
                <td>₹${(item.product?.price || 0) * (item.quantity || 1)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <h3>Total Amount: ₹${order.totalAmount || 0}</h3>
        </div>
        
        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>NicheNest - Supporting Local Artisans</p>
        </div>
      </body>
      </html>
    `;

    console.log("Invoice HTML generated successfully");
    
    // Set headers for HTML download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename=NicheNest_Invoice_${order._id.toString().slice(-8)}.html`);
    
    res.send(invoiceHTML);
  } catch (err) {
    console.error("Error generating invoice:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Full error object:", err);
    res.status(500).json({ error: "Failed to generate invoice", details: err.message });
  }
});

module.exports = router;
