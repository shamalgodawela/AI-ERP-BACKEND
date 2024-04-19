const mongoose = require("mongoose");
const { stringify } = require("querystring");

const exeproductSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"Exe"
    },
    
    name:{
        type:String,
        required:[true, "please add a name"],
        trim:true
    },
    sku:{
        type:String,
        required:true,
        default:"SKU"

    },
    productCode:{
        type:String,
        unique: true
       
    },
    quantity:{
        type:String,
        required:[true,"please add a quantity"],
        trim:true
    },
    price:{
        type:String,
        required:[true,"please add a price"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"please add a description"],
        trim:true
    },
    

   

},{
    timestamps:true,
}
);

const Exeproduct=mongoose.model("Exeproduct", exeproductSchema);
module.exports=Exeproduct;
