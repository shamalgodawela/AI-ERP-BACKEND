const mongoose = require("mongoose");
const { type } = require("os");

const sampleProductSchema = new mongoose.Schema({
    ProductName:{
        type:String,
        required:true
    },
    ProductCode:{
        type:String,
        required:true,
    },
    quantity:{
        type:String,
        required:true
    },
    PackSize:{
        type:String,
        required:true
    }


});

const dateProduct = mongoose.model("Sample", sampleProductSchema);

module.exports = dateProduct;
