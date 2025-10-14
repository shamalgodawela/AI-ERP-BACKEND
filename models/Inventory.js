const mongoose = require('mongoose');
const { type } = require('os');

const inventorySchema = new mongoose.Schema({
  area: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: String,
    required: true,
    trim: true
  },
  products: [
    {
      productName: { type: String, required: true, trim: true },
      productCode: { type: String, trim: true },
      quantity: { type: Number, required: true, default: 0 },
      labelPrice:{type:String},
      discount:{type:String},
      unitPrice:{type:String}
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
