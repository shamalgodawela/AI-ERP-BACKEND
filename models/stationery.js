const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    
});

const Stationery = mongoose.model("Stationery", productSchema);

module.exports = Stationery;
