const Product = require('../models/productModel'); // Import the old Product model
const DateProduct = require('../models/dateProduct'); // Import the new DateProduct model
const BulkProduct = require('../models/bulkproduct');


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

            // Find bulk products with the same product code
            const bulkProducts = await BulkProduct.find({ 'products.productCode': category });

            if (bulkProducts.length > 0) {
                let newQuantity, newQuantity2;

                // Check if category is BP20
                if (category === 'BP20') {
                    // Iterate over bulk products
                    for (const bulkProduct of bulkProducts) {
                        // Set weight based on bulk code
                        const weight = bulkProduct.products.productCode === 'BPB15' ? 15 : bulkProduct.products.productCode === 'GRN25' ? 5 : bulkProduct.weight;

                        // Update weight in bulk product
                        bulkProduct.weight = weight;
                        await bulkProduct.save();

                        // Calculate newQuantity for both bulk codes
                        const parsedPacksize = !isNaN(parseInt(packsize)) ? parseInt(packsize) : 0;
                        newQuantity = (weight * bulkProduct.quantity - numberOfUnits * parsedPacksize) / weight;
                        newQuantity2 = (weight * bulkProduct.quantity - numberOfUnits * parsedPacksize) / weight;

                        // Update quantity in BulkProduct
                        bulkProduct.quantity = newQuantity;
                        bulkProduct.newQuantity2 = newQuantity2; // Save newQuantity2 to bulk product
                        await bulkProduct.save();
                    }
                } else {
                    // Calculate newQuantity for single bulk product
                    const bulkProduct = bulkProducts[0];
                    const parsedPacksize = !isNaN(parseInt(packsize)) ? parseInt(packsize) : 0;
                    newQuantity = (bulkProduct.weight * bulkProduct.quantity - numberOfUnits * parsedPacksize) / bulkProduct.weight;

                    // Update quantity in BulkProduct
                    bulkProduct.quantity = newQuantity;
                    await bulkProduct.save();
                }
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
