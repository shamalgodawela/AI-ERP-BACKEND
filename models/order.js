const mongoose = require('mongoose');

// Define your schema
const orderSchema = new mongoose.Schema({
    products: [
        {
            productCode: String,
            productName: String,
            quantity: Number,
            labelPrice: Number,
            discount: {
                type: String,
                default: '-' // Set your default value here
            },
            unitPrice: Number,
            invoiceTotal: Number,
        }
    ],
    invoiceNumber: String,
    customer: String,
    code: String,
    address: String,
    contact: String,
    invoiceDate: String,
    orderNumber: {
        type: String,
        unique: true
    },
    orderDate: String,
    exe: String,
    status: String,
});

// Set default value before saving the document
orderSchema.pre('save', function(next) {
    // Loop through products array to set default discount value if not provided
    this.products.forEach(product => {
        if (!product.discount) {
            product.discount = '-';
        }
    });
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
