const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the Admin schema
const adminOperationSchema = new mongoose.Schema({
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
adminOperationSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Create and export the Admin model
const AdminOperation = mongoose.model('AdminOperation', adminOperationSchema);
module.exports =AdminOperation;
