const asyncHandler =require("express-async-handler");
const Customer=require("../models/customerModel")

const createCustomer = asyncHandler(async (req, res) => {
  const { name, code, companyName, contact, address, city, phone, email, fax } = req.body;

  // Validation
  if (!name || !code || !companyName || !contact || !address || !city || !phone) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  // Check if a customer with the same name or code already exists
  const existingCustomer = await Customer.findOne({ $or: [{ name }, { code }] });
  if (existingCustomer) {
    res.status(400);
    throw new Error("Customer with the same name or code already exists");
  }

  // Create customer
  const customer = await Customer.create({
    name,
    code,
    companyName,
    contact,
    address,
    city,
    phone,
    email,
    fax
  });

  res.status(201).json(customer);
});


//get all Customers

// controllers/customerController.js


const getCustomers = asyncHandler(async (req, res) => {
  const { name, code } = req.query;
  let query = {};

  if (name) {
    query.name = { $regex: new RegExp(name, 'i') }; // Case-insensitive search by name
  }

  if (code) {
    query.code = { $regex: new RegExp(code, 'i') }; // Case-insensitive search by code
  }

  const customers = await Customer.find(query);
  res.json(customers);
});



const getCustomerByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;

  // Find the customer by code
  const customer = await Customer.findOne({ code });

  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error("Customer not found");
  }
});



module.exports={
  createCustomer,
  getCustomers,
  getCustomerByCode,

}