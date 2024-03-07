const mongoose = require('mongoose');

const officeInventorySchema = new mongoose.Schema({
  codeNumber: {
    type: String,
    required: true,
    unique: true
  },
  model: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  dateOfPurchase: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  warrantyPeriod: {
    type: String,
    required: true
  },
  usedBy: {
    type: String,
    required: true
  }
});

const OfficeInventory = mongoose.model('OfficeInventory', officeInventorySchema);

module.exports = OfficeInventory;
