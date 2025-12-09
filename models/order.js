const mongoose = require('mongoose');
const { type } = require('os');

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
  orderNumber:{
    type:String,
    unique: true
  },
  orderDate:String,
  exe: String,
  status:String,
  VatRegNo:String,
  VatNO:String,
  TaxNo:String,

  CreditPeriod:{
    type:String,
    
  
  },

  Paymentmethod:{
    type:String,
  },
  CusVatNo:{
    type:String,
  },
  IncentiveDueDate: {
    type: String,
    required: true,
  },
  FreeissuedStatus:{
    type:String
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;