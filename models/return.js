const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
    products: [{
        productCode: String,
        productName: String,
        quantity: Number,
        unitPrice: Number,
        returntotal:Number,
    }],
    invoiceNumber: {
        type: String,
        required: true
    },
    customer: String,
    reason: String,
    date: String,
    remarks: String
});

const Return = mongoose.model('Return', returnSchema);

module.exports = Return;

