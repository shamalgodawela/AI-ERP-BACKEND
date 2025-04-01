const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ExpensesSchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    payto: {
        type: String,
        required: true
    },
    receivedPayment: {
        type: Boolean,
        required: true
    },
    authorizedBy: {
        type: String,
        required: true
    },
    signature: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Expenses', ExpensesSchema);