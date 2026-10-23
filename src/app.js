const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/product.routes');

const app = express();
app.use(express.json());

// Kiểm tra sức khỏe: dùng cho healthcheck Docker & CI ở các PROMPT sau
app.get('/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'error', db: dbUp ? 'connected' : 'disconnected' });
});

app.use('/api/products', productRoutes);

// Route không tồn tại
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Bộ xử lý lỗi chung
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', errors: Object.values(err.errors).map(e => e.message) });
  }
  if (err.code === 11000) return res.status(409).json({ message: 'pid already exists' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;