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
    unique: true,
    match:[
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email"
  ]
  },
  password: {
    type: String,
    required: true,
    minLength:[6, "password must be up to 6 characters"],
  },
  role: {
    type: String,
    default: "admin"
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
