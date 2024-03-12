const mongoose = require('mongoose');

const outstandingSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    backName:{
        type:String,
        required:true,
    },
    depositedate:{
        type:String,
        

    },
     CHnumber:{
        type:String,
        unique:true,
        

    },
    amount: {
        type: Number,
        required: true
    },
    outstanding: {
        type: Number,
        required: true
    }
});

const Outstanding = mongoose.model('Outstanding', outstandingSchema);

module.exports = Outstanding;

