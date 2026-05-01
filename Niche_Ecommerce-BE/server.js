const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const DB = require('./config/db');

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize app
const app = express();

// ✅ Connect DB
DB();

// ✅ Middleware
app.use(express.json());

// ✅ FIXED CORS (PRODUCTION + LOCALHOST)
const allowedOrigins = [
  process.env.FRONTEND_URL, // Vercel URL
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("❌ CORS not allowed: " + origin));
      }
    },
    credentials: true,
  })
);

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/artisans', require('./routes/artisans'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/api'));
app.use('/api/cart', require('./routes/cartRoutes'));

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ DesiEtsy API is running smoothly...');
});

// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: '❌ Route not found.' });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});