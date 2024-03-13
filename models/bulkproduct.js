const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
  bulkCode: {
    type: String,
    required: true,
    unique:true
  },
  quantity: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  totweight: {
    type: Number,
  }
});

// Create the Product model
const BulkProduct = mongoose.model('BulkProduct', productSchema);

module.exports = BulkProduct;
