const Return = require('../models/return');
const Invoice = require('../models/invoice');
const Product = require("../models/productModel");
const Inventory = require('../models/Inventory');

const escapeRegExp = (string) => {
    return String(string || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const normalizeStockValue = (value) => {
    return String(value || '')
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[.-_]/g, '');
};

const findInventoryByStockName = async (stockName) => {
    const normalizedName = String(stockName || '').trim();
    if (!normalizedName) return null;

    const candidates = new Set();
    const asIs = normalizedName;
    const mrExpanded = normalizedName.replace(/^m\.?\s*/i, 'Mr.');
    const noDots = normalizedName.replace(/\./g, '');
    const mrExpandedNoDots = mrExpanded.replace(/\./g, '');
    const collapsedSpaces = normalizedName.replace(/\s+/g, ' ').trim();
    const normalizedNoSpaces = normalizeStockValue(normalizedName);
    const normalizedMrNoSpaces = normalizeStockValue(mrExpanded);

    [asIs, mrExpanded, noDots, mrExpandedNoDots, collapsedSpaces].forEach((candidate) => {
        if (candidate && candidate.length) candidates.add(candidate);
    });

    const ownerRegexes = Array.from(candidates).map((candidate) => ({
        owner: { $regex: new RegExp(`^${escapeRegExp(candidate)}$`, 'i') },
    }));

    return Inventory.findOne({
        $or: [
            ...ownerRegexes,
            { ownerKey: { $in: [normalizedName.toLowerCase(), normalizedNoSpaces, normalizedMrNoSpaces] } },
            { areaKey: { $in: [normalizedName.toLowerCase(), normalizedNoSpaces, normalizedMrNoSpaces] } },
        ],
    });
};

const addReturnDetails = async (req, res) => {
    const {
        products,
        invoiceNumber,
        customer,
        reason,
        date,
        remarks,
        stockType,
        stockName,
    } = req.body;

    try {
        const selectedStockType = String(stockType || 'MS').toUpperCase();
        const selectedStockName = String(stockName || '').trim();
        const isMainStock = selectedStockType === 'MS' || selectedStockName.toLowerCase() === 'ms';

        if (!isMainStock && !selectedStockName) {
            return res.status(400).json({ message: 'Area stock name is required when stock target is area stock.' });
        }

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
                const { productCode, productName, quantity } = product;

                if (isMainStock) {
                    const existingProduct = await Product.findOne({
                        $or: [
                            { category: { $regex: new RegExp(`^${escapeRegExp(productCode)}$`, 'i') } },
                            { sku: { $regex: new RegExp(escapeRegExp(productCode), 'i') } },
                        ],
                    });

                    if (existingProduct) {
                        existingProduct.quantity = String(parseFloat(existingProduct.quantity || 0) + parseFloat(quantity || 0));
                        await existingProduct.save();
                    }
                } else {
                    const inventoryDoc = await findInventoryByStockName(selectedStockName);
                    if (!inventoryDoc) {
                        return res.status(404).json({ message: `No inventory found for stock "${selectedStockName}".` });
                    }

                    const normalize = (value) => String(value || '')
                        .toLowerCase()
                        .replace(/\s+/g, '')
                        .replace(/[.-_]/g, '');

                    const targetCode = normalize(productCode);
                    const targetName = normalize(productName);

                    let inventoryProduct = inventoryDoc.products.find((item) => {
                        const codeMatches = targetCode && normalize(item.productCode) === targetCode;
                        const nameMatches = targetName && normalize(item.productName) === targetName;
                        const exactCodeMatches = item.productCode && productCode && String(item.productCode).toLowerCase() === String(productCode).toLowerCase();
                        const exactNameMatches = item.productName && productName && String(item.productName).toLowerCase() === String(productName).toLowerCase();
                        return codeMatches || nameMatches || exactCodeMatches || exactNameMatches;
                    });

                    if (!inventoryProduct) {
                        inventoryDoc.products.push({
                            productName: productName || productCode,
                            productCode: productCode || '',
                            quantity: 0,
                            labelPrice: '',
                            discount: '',
                            unitPrice: '',
                        });
                        inventoryProduct = inventoryDoc.products[inventoryDoc.products.length - 1];
                    }

                    inventoryProduct.quantity = parseFloat(inventoryProduct.quantity || 0) + parseFloat(quantity || 0);
                    await inventoryDoc.save();
                }
            }

            const newReturn = new Return({
                products,
                invoiceNumber,
                customer,
                reason,
                date,
                remarks,
                stockType: selectedStockType,
                stockName: isMainStock ? '' : selectedStockName,
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
