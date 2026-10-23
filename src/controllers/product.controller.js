const Product = require('../models/product.model');

// GET /api/products
exports.getAll = async (req, res) => {
  const products = await Product.find().sort({ pid: 1 });
  res.json(products);
};

// GET /api/products/:pid
exports.getOne = async (req, res) => {
  const product = await Product.findOne({ pid: req.params.pid });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// POST /api/products
exports.create = async (req, res) => {
  const { pid, pname, price, quantity } = req.body;
  const product = await Product.create({ pid, pname, price, quantity });
  res.status(201).json(product);
};

// PUT /api/products/:pid
exports.update = async (req, res) => {
  const { pname, price, quantity } = req.body; // không cho sửa pid
  const product = await Product.findOneAndUpdate(
    { pid: req.params.pid },
    { pname, price, quantity },
    { returnDocument: 'after', runValidators: true, omitUndefined: true }
  );
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// DELETE /api/products/:pid
exports.remove = async (req, res) => {
  const product = await Product.findOneAndDelete({ pid: req.params.pid });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted', product });
};