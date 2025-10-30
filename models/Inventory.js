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
  // Normalized keys for consistent lookups and unique constraint
  areaKey: { type: String, required: true, index: true },
  ownerKey: { type: String, required: true, index: true },
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

// Compound unique index to prevent duplicate (area, owner) ignoring case/spacing via keys
inventorySchema.index({ areaKey: 1, ownerKey: 1 }, { unique: true });

// Ensure normalized keys are set
inventorySchema.pre('validate', function(next) {
  if (this.area) this.areaKey = String(this.area).trim().toLowerCase();
  if (this.owner) this.ownerKey = String(this.owner).trim().toLowerCase();
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
