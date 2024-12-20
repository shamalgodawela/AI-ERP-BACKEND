const mongoose = require('mongoose');
const { stringify } = require("querystring");

const TaxinvoiceSchema = new mongoose.Schema({
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
  VatRegNo:String,
  VatNO:String,
  TaxNo:String


  
  
});

const Invoice = mongoose.model('TaxInvoices', TaxinvoiceSchema);

module.exports = Invoice;