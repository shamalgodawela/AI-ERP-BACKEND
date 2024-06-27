const mongoose = require("mongoose");
const { stringify } = require("querystring");

const productSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"User"
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
    category:{
        type:String,
        unique:true
       
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
        type:Number,
        required:[true,"please add a description"],
        
    },
    image:{
        type:Object,
        default:{}
        
    }

   

},{
    timestamps:true,
}
);

const Product=mongoose.model("Product", productSchema)
module.exports=Product;
