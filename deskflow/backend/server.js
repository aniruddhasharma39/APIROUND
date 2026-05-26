const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const ticketRoutes = require('./routes/tickets');

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

// --- Routes ---
app.use('/tickets', ticketRoutes);

// --- 404 handler (unknown routes) ---
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// --- Global error handler ---
// Must have 4 params for Express to treat it as error middleware
app.use((err, req, res, next) => {
  console.error('[error]', err.message);

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const fields = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message])
    );
    return res.status(422).json({ errors: fields });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const code = err.statusCode || 500;
  res.status(code).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[server] DeskFlow API running on port ${PORT}`);
});
