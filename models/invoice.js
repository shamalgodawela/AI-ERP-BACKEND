const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
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
    type:String,
    required: true,
  },
  customer: String,
  code:String,
  address:String,
  contact:String,
  invoiceDate: String,
  orderNumber:String,
  orderDate:String,
  exe: String,
  ModeofPayment:String,
  TermsofPayment:String,
  Duedate:String,
  Tax: Number,
  GatePassNo: String,
  VehicleNo:String,
  
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;