const mongoose = require('mongoose');

const areaStockReturnSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            trim: true,
        },
        productCode: {
            type: String,
            required: true,
            trim: true,
        },
        productName: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const AreaStockReturn = mongoose.model('AreaStockReturn', areaStockReturnSchema);

module.exports = AreaStockReturn;
