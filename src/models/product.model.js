const { Schema, model } = require('mongoose');

const productSchema = new Schema(
  {
    pid: { type: String, required: [true, 'pid is required'], unique: true, trim: true },
    pname: { type: String, required: [true, 'pname is required'], trim: true },
    price: { type: Number, required: [true, 'price is required'], min: [0, 'price must be >= 0'] },
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'quantity must be >= 1'],
      validate: { validator: Number.isInteger, message: 'quantity must be an integer' },
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model('Product', productSchema);