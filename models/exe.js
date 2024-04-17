const mongoose= require ('mongoose');
const bcrypt =require("bcryptjs")

const exeSchema=mongoose.Schema({

    name:{
        type:String,
        require:[true,"please add a name"]

    },
    email:{
        type:String,
        require:[true, "please add a email"],
        unique:true,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email"
        ]
    },
    password:{
        type:String,
        require:[true,"please add a password"],
        minLength:[4, "password must be upto 4 character"]
    }

},
{
    timestamps:true,
}


)

exeSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next()
    }

    const salt=await bcrypt.genSalt(10)
    const hashedPassword=await bcrypt.hash(this.password, salt)
    this.password=hashedPassword;
    next();
})

const Exe= mongoose.model("Exe",exeSchema);
module.exports=Exe;