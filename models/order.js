const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  products: [
    {
      productCode: String,
      productName: String,
      quantity: Number,
      labelPrice: Number,
      discount: Number,
      unitPrice: Number,
      invoiceTotal: Number,
    }
  ],
  invoiceNumber: String,
  customer: String,
  code:String,
  address:String,
  contact:String,
  invoiceDate: String,
  orderNumber:String,
  orderDate:String,
  exe: String,
  status:String,
  
  
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;