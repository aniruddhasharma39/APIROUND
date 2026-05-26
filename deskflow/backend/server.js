const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- DB Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[db] MongoDB connected successfully');
  } catch (err) {
    console.error('[db] Connection failed:', err.message);
    process.exit(1);
  }
};

connectDB();

// --- Health check ---
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'DeskFlow API' });
});

// --- Error handling middleware (placeholder for routes) ---
app.use((err, req, res, next) => {
  const code = err.statusCode || 500;
  res.status(code).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[server] DeskFlow API running on port ${PORT}`);
});
