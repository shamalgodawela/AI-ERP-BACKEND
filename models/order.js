const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  products: [
    {
      productCode: { type: String, required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      labelPrice: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      unitPrice: { type: Number, required: true },
      invoiceTotal: { type: Number, required: true }
    }
  ],
  invoiceNumber: { type: String, required: true },
  customer: { type: String, required: true },
  code: String,
  address: String,
  contact: String,
  invoiceDate: { type: String, required: true },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  orderDate: { type: String, required: true },
  exe: String,
  status: String
});

// Adding index to orderNumber field for faster queries
orderSchema.index({ orderNumber: 1 }, { unique: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
