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

            // Define parsedPacksize here
            const parsedPacksize = !isNaN(parseInt(packsize)) ? parseInt(packsize) : 0;

            // Check if category is BP20
            if (category === 'BP20') {
                // Find the bulk code BPB15 in bulk products
                let bulkProductBPB15 = await BulkProduct.findOne({ bulkCode: 'BPB15' });
                if (bulkProductBPB15) {
                    // Calculate newQuantity for bulk code BPB15
                    let newQuantityBPB15 = (bulkProductBPB15.weight * bulkProductBPB15.quantity - numberOfUnits * 15) / bulkProductBPB15.weight;

                    // Update quantity for bulk code BPB15
                    bulkProductBPB15.quantity = newQuantityBPB15;
                    await bulkProductBPB15.save();
                }

                // Find the bulk code GRN25 in bulk products
                let bulkProductGRN25 = await BulkProduct.findOne({ bulkCode: 'GRN25' });
                if (bulkProductGRN25) {
                    // Calculate newQuantity for bulk code GRN25
                    let newQuantityGRN25 = (bulkProductGRN25.weight * bulkProductGRN25.quantity - numberOfUnits * 5) / bulkProductGRN25.weight;

                    // Update quantity for bulk code GRN25
                    bulkProductGRN25.quantity = newQuantityGRN25;
                    await bulkProductGRN25.save();
                }
            } else {
                // Find bulk products with the same product code
                const bulkProducts = await BulkProduct.find({ 'products.productCode': category });

                if (bulkProducts.length > 0) {
                    // Calculate newQuantity for single bulk product
                    const bulkProduct = bulkProducts[0];
                    let newQuantity = (bulkProduct.weight * bulkProduct.quantity - numberOfUnits * parsedPacksize) / bulkProduct.weight;

                    // Update quantity in BulkProduct
                    bulkProduct.quantity = newQuantity;
                    await bulkProduct.save();
                } else {
                    console.log('No bulkProduct found with the same product code.');
                    // If no bulk product found, return error
                    return res.status(404).json({ success: false, message: 'No bulkProduct found with the same product code.' });
                }
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
