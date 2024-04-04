// models/Customer.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },  
  companyName: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  fax: { type: String },
  district:{type:String,required :true}
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
