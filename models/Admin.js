const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the Admin schema
const adminSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Method to compare hashed passwords
// Admin model method
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Create and export the Admin model
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
