const Return = require('../models/return');
const Invoice = require('../models/invoice');
const Product = require("../models/productModel");

const addReturnDetails = async (req, res) => {
    const {
        products,
        invoiceNumber,
        customer,
        reason,
        date,
        remarks
    } = req.body;

    try {
        const existingInvoice = await Invoice.findOne({ invoiceNumber: { $regex: new RegExp(invoiceNumber, "i") } });

        if (existingInvoice) {
            for (const product of products) {
                const { productCode, quantity } = product;
                const productInInvoice = existingInvoice.products.find(p => p.productCode === productCode);

                if (productInInvoice) {
                    productInInvoice.quantity -= quantity;
                }
            }

            await existingInvoice.save();

            for (const product of products) {
                const { productCode, quantity } = product;
                
                // Find the product by category in the Product database
                const existingProduct = await Product.findOne({ category: productCode });
                
                if (existingProduct) {
                    // Update the quantity of the existing product
                    existingProduct.quantity = parseFloat(existingProduct.quantity) + parseFloat(quantity);
                    await existingProduct.save();
                }
                
            }
            
            

            const newReturn = new Return({
                products,
                invoiceNumber,
                customer,
                reason,
                date,
                remarks
            });

            const savedReturn = await newReturn.save();

            res.status(201).json(savedReturn);
        } else {
            console.error('No matching invoice found');
            res.status(404).json({ message: 'No matching invoice found' });
        }
    } catch (error) {
        console.error('Error adding return details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const getAllReturnDetails = async (req, res) => {
    try {
        const returnDetails = await Return.find();
        res.status(200).json(returnDetails);
    } catch (error) {
        console.error('Error fetching return details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { addReturnDetails, getAllReturnDetails };
