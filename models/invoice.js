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
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  customer: String,
  code: String,
  address: String,
  contact: String,
  invoiceDate: String,

  orderNumber: {
    type: String,
    trim: true
  },

  orderDate: String,
  exe: String,
  ModeofPayment: String,
  TermsofPayment: String,
  Duedate: String,
  Tax: Number,

  GatePassNo: {
    type: String,
    default: "Printed",
    trim: true
  },

  VehicleNo: String,
  VatRegNo: String,
  VatNO: String,
  TaxNo: String,

  CusVatNo: {
    type: String,
    unique: true
  },

  IncentiveDueDate: String,
  IncentiveStatus: String,
  Incentivesettlement: String,

  StockName: String,
  FreeissuedStatus: String,

  // 🔹 NEW: Cheque details (multiple allowed)
  cheques: [
    {
      chequeNo: {
        type: String,
        trim: true
      },
      bankName: {
        type: String,
        trim: true
      },
      depositDate: {
        type: String
      },
      amount: {
        type: Number
      },
      status: {
        type: String,
        default: "Pending" 
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]

}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
