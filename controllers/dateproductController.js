const Product = require('../models/productModel'); // Import the old Product model
const DateProduct = require('../models/dateProduct'); // Import the new DateProduct model
const BulkProduct = require('../models/bulkproduct');


// Controller function to add a new product and update existing products based on category match
const addProductAndUpdate = async (req, res) => {
    const { GpnDate, GpnNumber, productName, category, unitPrice, numberOfUnits, packsize } = req.body;

    try {
        console.log('Request SKU:', category); // Debugging output

        // Find existing product with the same SKU
        const existingProduct = await Product.findOne({
            sku: { $regex: new RegExp(category, "i") }
        });

        if (existingProduct) {
            const parsedNumberOfUnits = parseFloat(numberOfUnits);
            const parsedExistingQuantity = parseFloat(existingProduct.quantity);

            // Update quantity by adding parsedNumberOfUnits
            existingProduct.quantity = parsedExistingQuantity + parsedNumberOfUnits;
            await existingProduct.save();

            // Find bulk product with the same product code
            const bulkProduct = await BulkProduct.findOne({ 'products.productCode': category });

            if (bulkProduct) {
                let newQuantity;

      // Check if all necessary values are valid numbers
if (!isNaN(bulkProduct.weight) && !isNaN(bulkProduct.quantity) && !isNaN(numberOfUnits)) {
    // Convert packsize to an integer only if it represents a valid number
    const parsedPacksize = !isNaN(parseInt(packsize)) ? parseInt(packsize) : 0;

    // Calculate newQuantity if packsize is a valid number
    newQuantity = (bulkProduct.weight * bulkProduct.quantity - numberOfUnits * parsedPacksize) / bulkProduct.weight;
} else {
    // If any of the values are not valid numbers, set newQuantity to 0 or handle it accordingly
    newQuantity = 0; // Or handle it based on your requirements
}

                

                // Update quantity in BulkProduct
                bulkProduct.quantity = newQuantity;
                await bulkProduct.save();
            } else {
                console.log('No bulkProduct found with the same product code.');
                // If no bulk product found, return error
                return res.status(404).json({ success: false, message: 'No bulkProduct found with the same product code.' });
            }

            const totweight = numberOfUnits * parseInt(packsize);

            // Create a new product using the dateProduct data
            const newProduct = await DateProduct.create({
                GpnDate,
                GpnNumber,
                productName,
                category,
                unitPrice,
                numberOfUnits,
                packsize,
                totweight
            });

            // Send success response
            return res.status(201).json({ success: true, message: 'Product added successfully.', product: newProduct });
        } else {
            console.log('No existing product found with the same SKU.');
            return res.status(404).json({ success: false, message: 'No existing product found with the same SKU.' });
        }
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({ success: false, message: 'Failed to add product.', error: error.message });
    }
};


// Controller function to get all dateProducts
const getAllDateProducts = async (req, res) => {
    try {
        // Find all dateProduct documents
        const allDateProducts = await DateProduct.find();

        // Return the array of all dateProduct documents
        res.status(200).json(allDateProducts);
    } catch (error) {
        // Handle errors
        console.error('Error fetching dateProducts:', error);
        res.status(500).json({ error: 'Failed to fetch dateProducts' });
    }
};

module.exports = { addProductAndUpdate, getAllDateProducts };
