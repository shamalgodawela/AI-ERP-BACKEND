const BulkProduct = require('../models/bulkproduct');

// Controller function to add a new product to the database
const addProduct = async (req, res) => {
  try {
    // Extract data from request body
    const { bulkCode, quantity, weight } = req.body;

    // Calculate total weight
    const totweight = quantity * weight;

    // Create a new product instance
    const newProduct = new BulkProduct({
      bulkCode,
      quantity,
      weight,
      totweight
    });

    // Save the new product to the database
    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
};
const getAllProducts = async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await BulkProduct.find();

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
module.exports = { 
  addProduct,
  getAllProducts
};
