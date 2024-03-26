const Return = require('../models/return');

const addReturnDetails = async (req, res) => {
    try {
        // Extract data from the request body
        const { products, invoiceNumber, customer, reason, date, remarks } = req.body;

        // Find the invoice based on the provided invoiceNumber
        const invoice = await Invoice.findOne({ invoiceNumber });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Find the product in the invoice's products array based on the provided productCode
        const product = invoice.products.find(prod => prod.productCode === products[0].productCode);

        if (!product) {
            return res.status(404).json({ message: 'Product not found in the invoice' });
        }

        // Calculate the returntotal for the returned product
        const returntotal = products[0].quantity * products[0].unitPrice;

        // Reduce the invoiceTotal of the invoice by the returntotal of the returned product
        product.invoiceTotal -= returntotal;

        // Save the updated invoice back to the database
        await invoice.save();

        // Now proceed with adding the return details
        // Your existing code to add return details goes here...
    } catch (error) {
        // Handle errors
        console.error('Error adding return details:', error);
        res.status(500).json({ message: 'An error occurred while adding return details' });
    }
};




module.exports = { addReturnDetails };
