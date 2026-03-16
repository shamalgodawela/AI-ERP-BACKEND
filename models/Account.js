const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountId: {
    type: Number,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']
  },
  balance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Account', accountSchema);