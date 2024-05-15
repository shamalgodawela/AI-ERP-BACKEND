const mongoose = require('mongoose');
const { stringify } = require("querystring");

const CaninvoiceSchema = new mongoose.Schema({
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
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim:true
  },
  customer: String,
  code: String,
  address: String,
  contact: String,
  invoiceDate: String,
  orderNumber: {
    type: String,
    trim:true
  },
  orderDate: String,
  exe: String,
  ModeofPayment: String,
  TermsofPayment: String,
  Duedate: String,
  Tax: Number,
  GatePassNo: String,
  VehicleNo: String,
  
  
});

const CanInvoice = mongoose.model('CanInvoice', CaninvoiceSchema);

module.exports = CanInvoice;