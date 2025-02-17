const asyncHandler =require("express-async-handler");
const Exe = require("../models/exe");
const jwt = require("jsonwebtoken");
const bcrypt =require("bcryptjs");
const Invoice= require('../models/invoice')



const generateToken=(id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
  
  };


const exeregister = asyncHandler( async(req,res)=>{
    const {name, email, password} =req.body

    if(!name || !email || !password)
    {
        res.status(400)
        throw new Error("please fill all required feilds")
    }
    if(password.length<6){
        res.status(400)
        throw new Error("password must be up tp 6 characters")
    
    }
    const existExe = await Exe.findOne({email})
    if(existExe){
        res.status(400)
        throw new Error("Email is already used")
    }

    const newExe= await Exe.create({
        name,
        email,
        password
    })

    //geerate token

    const token= generateToken(newExe._id);
    // sent http-only cookie
    res.cookie("token", token, {
    path:"/",
    httpOnly: true,
    expires: new Date(Date.now()+ 1000 * 86400),// 1 day
    sameSite:"none",
    secure:true,
  });
    
  if(newExe){
    const {_id,name, email}=newExe
    res.status(201).json({
        _id, 
        name,
        email, 
        token
        
    })

  }
  else{
    res.status(400)
    throw new Error("invalid user data")
  }
   
}); 

//Login exe

const loginExe=asyncHandler (async(req,res)=>{
  const {email, password}= req.body

  //validate request
  if(!email || !password){
    res.status(400);
    throw new Error("please fill the email and /or password of  your account")
  }
  // check if user exists
  const user= await Exe.findOne({email})
  if(!user){
    res.status(400);
    throw new Error("User not found")
  }

  //user exists, check password is correct
  const passwordIsCorrect= await bcrypt.compare(password, user.password);
  //generate token
const token=generateToken(user._id);

// sent http-only cookie

if(passwordIsCorrect){
res.cookie("token", token, {
  path:"/",
  httpOnly: true,
  expires: new Date(Date.now()+ 1000 * 86400),// 1 day
  sameSite:"none",
  secure:true,
});

}
  if (user && passwordIsCorrect){
    const {_id,name,email}= user
    res.status(200).json({
        _id, 
        name,
        email,   
        token,
    });

    
  }else{
    res.status(400)
    throw new Error("invalid email or password")
  }

});



const logoutexe= asyncHandler (async(req,res)=>{
    res.cookie("token", "", {
        path:"/",
        httpOnly: true,
        expires: new Date(0),
        sameSite:"none",
        secure:true,
      });
      return res.status(200).json({message:"successfully log out"})
})

const loginStatusexe= asyncHandler(async(req,res)=>{
  const token =req.cookies.token;
  if(!token){
    return res.json(false)
  }
  
   const verified=jwt.verify(token, process.env.JWT_SECRET);
   if(verified){
    return res.json(true)
   }
   return res.json(false)
})

const exeinvoice = async (req, res) => {
  try {
      const { password } = req.query;

      let exeValue;
      if (password === '1234') {
          exeValue = 'Mr.Ahamed';
      } else if (password === '0909') {
          exeValue = 'Mr.Dasun';
      } else {
          return res.status(401).json({ message: 'Invalid password' });
      }

      
      const invoices = await Invoice.find({ exe: exeValue });

      res.json(invoices);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};




module.exports={
    exeregister,
    loginExe,
    logoutexe,
    loginStatusexe,
    exeinvoice

}