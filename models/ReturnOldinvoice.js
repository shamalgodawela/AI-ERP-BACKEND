const mongoose= require('mongoose');

const returnoldISchema= new mongoose.Schema({

    InvoiceNo:{
        type:String,
        required:true,
    },
    Customer:{
        type:String,
        required:true,
    },
    ProductCode:{
        required:true,
        type:String,
    },
    ProductName:{
        type:String,

    },
    quantity:{
        type:Number,
        required:true,
    }

})

const RetunNoteOldI=mongoose.model('ReturnOldI',returnoldISchema);
module.exports=RetunNoteOldI;