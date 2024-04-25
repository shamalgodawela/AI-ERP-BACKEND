const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  products: [
    {
      productCode: String,
      productName: String,
      quantity: Number,
      labelPrice: Number,
      discount: {
                type: String,
                default: '-' // Set your default value here
            },
      unitPrice: Number,
      invoiceTotal: Number,
    }
  ],
  invoiceNumber: {
    type:String,
    required: true,
    unique:true,
    
  },
  customer: String,
  code:String,
  address:String,
  contact:String,
  invoiceDate: String,
  orderNumber:{
    type:String,
  },
  orderDate:String,
  exe: String,
  ModeofPayment:String,
  TermsofPayment:String,
  Duedate:String,
  Tax: Number,
  GatePassNo: String,
  VehicleNo:String,
  
});
// Set default value before saving the document
invoiceSchema.pre('save', function(next) {
    // Loop through products array to set default discount value if not provided
    this.products.forEach(product => {
        if (!product.discount) {
            product.discount = '-';
        }
    });
    next();
});
const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;