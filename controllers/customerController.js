const asyncHandler =require("express-async-handler");
const Customer=require("../models/customerModel")

const createCustomer = asyncHandler(async (req, res) => {
  const { name, code, companyName, contact, address, city, phone, email, fax, district } = req.body;

  // Validation
  if (!name || !code || !companyName || !contact || !address || !city || !phone || BankName || AccountNo ) {
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
    fax,
    district,
    BankName,
    AccountNo,
    Branch,
    OtherAccunt
    
  });

  res.status(201).json(customer);
});


//get all Customers




const getCustomers = asyncHandler(async (req, res) => {
  const { name, code } = req.query;
  let query = {};

  if (name) {
    query.name = { $regex: new RegExp(name, 'i') }; 
  }

  if (code) {
    query.code = { $regex: new RegExp(code, 'i') }; 
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
const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, code, companyName, contact, address, city, phone, email, fax,district,BankName,AccountNo,Branch,OtherAccunt } = req.body;

  try {
    // Find the customer by id
    const customer = await Customer.findById(id);

    if (!customer) {
      res.status(404);
      throw new Error("Customer not found");
    }

    // Update customer details
    if (name) customer.name = name;
    if (code) customer.code = code;
    if (companyName) customer.companyName = companyName;
    if (contact) customer.contact = contact;
    if (address) customer.address = address;
    if (city) customer.city = city;
    if (phone) customer.phone = phone;
    if (email) customer.email = email;
    if (fax) customer.fax = fax;
    if (district) customer.district = district;
    if (BankName) customer. BankName = BankName;
    if (AccountNo) customer.AccountNo = AccountNo;
    if (Branch) customer.Branch = Branch;
    if (OtherAccunt) customer.OtherAccunt = OtherAccunt;

    // Validation
    if (!customer.name || !customer.code || !customer.companyName || !customer.contact || !customer.address || !customer.city || !customer.phone) {
      res.status(400);
      throw new Error("Please fill all required fields");
    }

    // Save the updated customer
    const updatedCustomer = await customer.save();

    res.json(updatedCustomer);
  } catch (error) {
    res.status(500);
    throw new Error("Failed to update customer details");
  }
});
const getCustomerById = asyncHandler(async (req, res) => {
  const customerId = req.params.id;

  // Find the customer by ID
  const customer = await Customer.findById(customerId);

  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error("Customer not found");
  }
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const customerId = req.params.id; // Get the customer ID from the request parameters

  // Use Mongoose's findByIdAndDelete method to delete the customer by ID
  const deletedCustomer = await Customer.findByIdAndDelete(customerId);

  if (deletedCustomer) {
    res.status(200).json({ message: 'Customer deleted successfully' });
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
});


module.exports={
  createCustomer,
  getCustomers,
  getCustomerByCode,
  updateCustomer,
  getCustomerById,
  deleteCustomer

}