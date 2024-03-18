const BulkProduct = require('../models/bulkproduct');

// Controller function to add a new product to the database
const addProduct = async (req, res) => {
  try {
    // Extract data from request body
    const { bulkCode, products, quantity, weight,weightsh } = req.body;
// Create a new bulk product instance
    const newBulkProduct = new BulkProduct({
      bulkCode,
      products,
      quantity,
      weight,
      weightsh
      
    });

    // Save the new bulk product to the database
    await newBulkProduct.save();

    res.status(201).json({ message: 'Bulk product added successfully', product: newBulkProduct });
  } catch (error) {
    console.error('Error adding bulk product:', error);
    res.status(500).json({ error: 'Failed to add bulk product' });
  }
};


// Controller function to get all products from the database
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
