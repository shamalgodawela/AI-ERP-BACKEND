const Product = require('../models/stationery');

async function createProduct(req, res) {
    try {
        const { code, name, quantity, price } = req.body;

        // Create a new product instance
        const product = new Product({
            code,
            name,
            quantity,
            price,
            
        });

        
        await product.save();

        res.status(201).json({ success: true, message: 'Product created successfully', product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Error creating product', error: error.message });
    }
}
const getAllProducts = async (req, res) => {
    try {
      const products = await Product.find(); // Retrieve all products from the database
      res.status(200).json(products); // Send the products as a JSON response
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

module.exports = {
    createProduct,
    getAllProducts
};
