const mongoose = require('mongoose');

const returnOldIvoice= new mongoose.Schema({
    invoiceNo:{
        type:String,
        require:true
    },
    InvoiceDte:{
        type:String,
        require:true
    },
    Customer:{
        type:String,
        require:true
    },
    ProductCode:{
        type:String,
        require:true
    },
    productName:{
        type:String,
        require:true
    },
    quanity:{
        type:String,
        require:true
    },
    value:{
        type:String,
        require:true,
    },
    reason:{
        type:String,
        require:true,
    }

})
const returnInvoice= mongoose.model('Returnoldinvoice',returnOldIvoice);
module.exports=returnInvoice;






























































































































