const mongoose= require('mongoose');

const NewBulkproductSchema= new mongoose.Schema({
    ProductName:{
        type:String,
        require:true,
    },
    BulkCode:{
        type:String,
        require:true,
    },
    quantity:{
        type:String,
        require:true,
    },
    VehicleNo:{
        type:String,
        require:true,
    },
    DriverName:{
        type:String,
        require:true,
    },
    DriverId:{
        type:String,
        require:true,

    },
    InsertedDate:{
        type:String,
        require:true
    },

})

const Bulkdetails= mongoose.model('Newbulkdetails',NewBulkproductSchema);
module.exports=Bulkdetails;