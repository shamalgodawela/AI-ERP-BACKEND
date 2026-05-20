const Product = require('../models/productModel');
const DateProduct = require('../models/dateProduct');
const BulkProduct = require('../models/bulkproduct');

/**
 * Reduces bulk quantity for the batch identified by BulkGRN,
 * using the finished product's grams-per-unit from products[].productweight.
 */
const reduceBulkQuantity = async (BulkGRN, productCode, numberOfUnits) => {
    const trimmedGrn = (BulkGRN || '').trim();
    const trimmedCode = (productCode || '').trim();

    if (!trimmedGrn || !trimmedCode) {
        return { success: false, message: 'BulkGRN and product code are required.' };
    }

    const bulkProduct = await BulkProduct.findOne({ BulkGRN: trimmedGrn });
    if (!bulkProduct) {
        return { success: false, message: `No bulk batch found for BulkGRN: ${trimmedGrn}.` };
    }

    const normalizedCode = trimmedCode.toUpperCase();
    const matchedProduct = bulkProduct.products.find(
        (p) => p.productCode && p.productCode.trim().toUpperCase() === normalizedCode
    );

    if (!matchedProduct) {
        return {
            success: false,
            message: `Product code "${trimmedCode}" is not registered on bulk ${trimmedGrn}.`,
        };
    }

    const gramsPerUnit = parseFloat(matchedProduct.productweight);
    const units = parseFloat(numberOfUnits);

    if (isNaN(gramsPerUnit) || gramsPerUnit <= 0) {
        return { success: false, message: 'Invalid product weight on bulk record.' };
    }
    if (isNaN(units) || units <= 0) {
        return { success: false, message: 'Invalid number of units.' };
    }

    const gramsUsed = units * gramsPerUnit;
    const totalGrams = bulkProduct.weight * bulkProduct.quantity;

    if (gramsUsed > totalGrams) {
        const availableUnits = totalGrams / gramsPerUnit;
        return {
            success: false,
            message: `Insufficient bulk. Available ~${availableUnits.toFixed(2)} units, requested ${units}.`,
        };
    }

    bulkProduct.quantity = (totalGrams - gramsUsed) / bulkProduct.weight;
    await bulkProduct.save();

    return {
        success: true,
        bulkProduct,
        gramsUsed,
        gramsPerUnit,
    };
};

const addProductAndUpdate = async (req, res) => {
    const { GpnDate, BulkGRN, productName, category, unitPrice, numberOfUnits, packsize } = req.body;

    try {
        const existingProduct = await Product.findOne({
            sku: { $regex: new RegExp(category, 'i') },
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'No existing product found with the same SKU.',
            });
        }

        const bulkResult = await reduceBulkQuantity(BulkGRN, category, numberOfUnits);
        if (!bulkResult.success) {
            return res.status(400).json({ success: false, message: bulkResult.message });
        }

        const parsedNumberOfUnits = parseFloat(numberOfUnits);
        const parsedExistingQuantity = parseFloat(existingProduct.quantity);
        existingProduct.quantity = parsedExistingQuantity + parsedNumberOfUnits;
        await existingProduct.save();

        const totweight = numberOfUnits * parseInt(packsize, 10);

        const newProduct = await DateProduct.create({
            GpnDate,
            BulkGRN,
            productName,
            category,
            unitPrice,
            numberOfUnits,
            packsize,
            totweight,
        });

        return res.status(201).json({
            success: true,
            message: 'Product added successfully.',
            product: newProduct,
            bulkUpdate: {
                BulkGRN: bulkResult.bulkProduct.BulkGRN,
                remainingQuantity: bulkResult.bulkProduct.quantity,
                gramsUsed: bulkResult.gramsUsed,
            },
        });
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add product.',
            error: error.message,
        });
    }
};

const getAllDateProducts = async (req, res) => {
    try {
        const allDateProducts = await DateProduct.find();
        res.status(200).json(allDateProducts);
    } catch (error) {
        console.error('Error fetching dateProducts:', error);
        res.status(500).json({ error: 'Failed to fetch dateProducts' });
    }
};

module.exports = { addProductAndUpdate, getAllDateProducts, reduceBulkQuantity };
