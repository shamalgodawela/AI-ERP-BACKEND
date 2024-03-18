const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
  products:[
    {
      productCode:
      {
        type:String,
        required:true
      
      },
      
    }
  ],
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
  weightsh: {
    type: String,
    required: true
  }
  
 
});

// Create the Product model
const BulkProduct = mongoose.model('BulkProduct', productSchema);

module.exports = BulkProduct;
