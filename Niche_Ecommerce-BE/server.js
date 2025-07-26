const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const DB = require('./config/db');

// ✅ Load environment variables from .env
dotenv.config();

// ✅ Initialize Express app
const app = express();

// ✅ Connect to MongoDB
DB();

// ✅ Middleware
app.use(express.json());
app.use(
  cors({
    origin: /http:\/\/localhost:\d+/, // Allow any localhost port for dev
    credentials: true,
  })
);

// ✅ API Routes
app.use('/api/auth', require('./routes/auth'));                             // 🔐 User authentication
app.use('/api/products', require('./routes/products'));                 // 🛍 Product CRUD
app.use('/api/artisans', require('./routes/artisans'));                 // 👩‍🎨 Artisan management
app.use('/api/orders', require('./routes/orders'));                     // 📦 Orders
app.use('/api/newsletter', require('./routes/newsletterRoutes'));       // 📧 Newsletter
app.use('/api/users', require('./routes/users'));                       // 👤 User profiles & activity
app.use('/api/dashboard', require('./routes/api'));                     // 📊 Admin stats
app.use('/api/cart', require('./routes/cartRoutes'));                   // 🛒 Cart, Promo & Checkout

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ DesiEtsy API is running smoothly...');
});

// ❌ 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({ error: '❌ Route not found.' });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});