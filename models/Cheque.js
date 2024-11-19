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
        type:String,
        required:true,
    },
    DepositeDate:{
        type:String,
    }
    

});


const Cheque = mongoose.model("cheque",ChequeSchema);
module.exports = Cheque;