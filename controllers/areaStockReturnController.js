const Product = require('../models/productModel');
const AreaStockReturn = require('../models/areaStockReturn');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findProductByCode = async (productCode) => {
    const code = (productCode || '').trim();
    if (!code) return null;

    const safeCode = escapeRegex(code);
    return Product.findOne({
        $or: [
            { category: { $regex: new RegExp(`^${safeCode}$`, 'i') } },
            { sku: { $regex: new RegExp(safeCode, 'i') } },
        ],
    });
};

const addAreaStockReturn = async (req, res) => {
    const { invoiceNumber, productCode, productName, price, quantity } = req.body;

    try {
        const parsedQuantity = parseFloat(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive number.',
            });
        }

        const existingProduct = await findProductByCode(productCode);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'No product found with this product code.',
            });
        }

        const parsedExistingQty = parseFloat(existingProduct.quantity) || 0;
        existingProduct.quantity = String(parsedExistingQty + parsedQuantity);
        await existingProduct.save();

        const newReturn = await AreaStockReturn.create({
            invoiceNumber: (invoiceNumber || '').trim(),
            productCode: (productCode || '').trim(),
            productName: productName || existingProduct.name,
            price: parseFloat(price) || parseFloat(existingProduct.price) || 0,
            quantity: parsedQuantity,
        });

        return res.status(201).json({
            success: true,
            message: 'Area stock return added successfully.',
            data: newReturn,
        });
    } catch (error) {
        console.error('Error adding area stock return:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add area stock return.',
            error: error.message,
        });
    }
};

const getAllAreaStockReturns = async (req, res) => {
    try {
        const returns = await AreaStockReturn.find().sort({ createdAt: -1 });
        return res.status(200).json(returns);
    } catch (error) {
        console.error('Error fetching area stock returns:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch area stock returns.',
        });
    }
};

module.exports = { addAreaStockReturn, getAllAreaStockReturns };
