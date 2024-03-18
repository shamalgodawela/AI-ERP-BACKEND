const mongoose = require("mongoose");

const dateproductNewSchema = new mongoose.Schema({
    GpnDate: {
        type: String,
        required: true
    },
    GpnNumber: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    unitPrice: {
        type: Number,
        required: true
    },
    numberOfUnits: {
        type: Number,
        required: true
    },
    packsize:{
        type:String,
    },
    totweight:{
        type:Number,

    }

});

const dateProduct = mongoose.model("dateProduct", dateproductNewSchema);

module.exports = dateProduct;
