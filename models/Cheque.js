const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChequeSchema= new Schema({
    invoiceNumber:{
        type:String,
        required:true,
    },
    ChequeNumber:{
        type:String,
        required:true,

    },
    ChequeValue:{
        type:Number,
        required:true,
    },
    DepositeDate:{
        type:String,
    },
    Bankdetails:{
        type:String,
    }
    

});


const Cheque = mongoose.model("cheque",ChequeSchema);
module.exports = Cheque;