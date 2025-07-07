const asyncHandler =require("express-async-handler");
const  User =require("../models/userModel");
const { use } = require("../routes/userRoute");
const bcrypt =require("bcryptjs");
const jwt = require("jsonwebtoken");
const Token = require("../models/tokenModel");
const crypto=require("crypto");
const sendEmail = require("../utils/sendEmail");

const generateToken=(id)=>{
  return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})

};

//register user-----------------------------------------------------------------------------------------------------------------------

const registerUser=asyncHandler( async (req, res)=>{
   const {name, email, password,role}= req.body

   //validation

   if(!name || !email || !password){

    res.status(400)
    throw new Error("please fill all required feilds")

   }
   if(password.length<6){
    res.status(400)
    throw new Error("password must be up tp 6 characters")

   }

   //check if user email already exists

  const userExists= await User.findOne({email})
  if(userExists){
    res.status(400)
    throw new Error("Email has already used")

  }

  //create new user
  const user = await User.create({
    name,
    email,
    password,
    role
  })
  //generate token
const token=generateToken(user._id);

// sent http-only cookie
res.cookie("token", token, {
  path:"/",
  httpOnly: true,
  expires: new Date(Date.now()+ 1000 * 86400),// 1 day
  sameSite:"none",
  secure:true,
});

  if(user){
    const {_id,name,email, photo, phone, bio}= user
    res.status(201).json({
        _id, 
        name,
        email, 
        photo, 
        phone, 
        bio,
        token,
        role
        
    })
  }else{
    res.status(400)
    throw new Error("invalid user data")
  }


});

// login user----------------------------------------------------------------------------------------------------------

const loginUser=asyncHandler( async(req, res)=>{
  const {email, password}= req.body

  //validate request
  if(!email || !password){
    res.status(400);
    throw new Error("please fill the email and /or password of  your account")
  }
  // check if user exists
  const user= await User.findOne({email})
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
    const {_id,name,email, photo, phone, bio,role}= user
    res.status(200).json({
        _id, 
        name,
        email, 
        photo, 
        phone, 
        bio,   
        token,
        role
    });

    
  }else{
    res.status(400)
    throw new Error("invalid email or password")
  }
})
// Logout user----------------------------------------------------------------------------------------------------------------------

const logout= asyncHandler(async(req, res)=>{
  
res.cookie("token", "", {
    path:"/",
    httpOnly: true,
    expires: new Date(0),
    sameSite:"none",
    secure:true,
  });
  return res.status(200).json({message:"successfully log out"})

})


//get user data-------------------------------------------------------------------------------------------------------------------------

const getUser =asyncHandler(async(req, res)=>{
  const user= await User.findById(req.user._id)

  if(user){
    const {_id,name,email, photo, phone, bio}= user;
    res.status(200).json({
        _id, 
        name,
        email, 
        photo, 
        phone, 
        bio,
       
        
    })
  }else{
    res.status(400)
    throw new Error("user not found")
  }

});

//Get login status(if user logged , he or she dont have to login the system again)--------------------------------------------------------------------------------------------------------
const loginStatus= asyncHandler(async(req,res)=>{
  const token =req.cookies.token;
  if(!token){
    return res.json(false)
  }
   //verify token
   const verified=jwt.verify(token, process.env.JWT_SECRET);
   if(verified){
    return res.json(true)
   }
   return res.json(false)
})

//Update user----------------------------------------------------------------------------------------------------------------------

const updateUser=asyncHandler(async(req,res)=>{
  const user= await User.findById(req.user._id);

  if(user){
    const {name,email, photo, phone, bio}= user;
    user.email= email;
    user.name=req.body.name || name;
    user.phone=req.body.phone || phone;
    user.bio=req.body.bio || bio;
    user.photo=req.body.photo || photo;


    const updatedUser= await user.save()
    res.status(200).json({
      _id: updatedUser._id,
      name:updatedUser.name,
      email:updatedUser.email,
      photo:updatedUser.photo,
      phone:updatedUser.phone,
      bio:updatedUser.bio,
    })

  }else{
    res.status(404)
    throw new Error("User not found")
  }


})

// change password
 const changePassword=asyncHandler(async(req,res)=>{
  const user= await User.findById(req.user._id);

  const {oldPassword, password}= req.body
  if(!user){
    res.status(400)
    throw new Error("User not found ....");
  }

  //validate

  if(!oldPassword || !password){
    res.status(400)
    throw new Error("please add old and new pasword");
  }
  // check if old password matches password in DB
  const passwordIsCorrect=await bcrypt.compare(oldPassword, user.password)

  // Save new password

  if(user && passwordIsCorrect){
    user.password= password
    await user.save();
    res.status(200).send("password changed successful")
  }else{
    res.status(400)
    throw new Error("old password is incorrect");

  }

  
  

 })

//fogotPassword password

const fogotPassword=asyncHandler(async(req,res)=>{
  const {email}= req.body
  const user= await User.findOne({email})

  if(!user){
    res.status(404)
    throw new Error("user does not exist")
  }
  //delete token if exist
let token= await Token.findOne({userId: user._id})
if(token){
  await token.deleteOne()
}


  //create reset token

  let resetToken= crypto.randomBytes(32).toString("hex")+ user._id
  console.log(resetToken);

  // hash token before saving to db
  const hashedToken= crypto.createHash("sha256").update(resetToken).digest("hex")
  //save token to db

  await new Token({
    userId:user._id,
    token:hashedToken,
    createdAt:Date.now(),
    expiresAt:Date.now()+ 30 *(60*1000)// 30 min
  }).save()

  // construct reset URL

  const resetUrl= `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

  //reset email-------------------------------------------------------------------------------------------------

  const message= `
  <h2>Hello ${user.name}</h2>
  <p>please use the url below to reset your password</p>
  <p>reset link valid for 30 min</p>
  <a href=${resetUrl} clicktracking=off >${resetUrl}</a>

  <p>Regards.....</p>
  <p>Nihon team</p>
  
  
  `;

  const subject= "password reset request "
  const send_to=user.email
  const sent_from=process.env.EMAIL_USER

  try {
    await sendEmail(subject, message, send_to, sent_from)
    res.status(200).json({success:true, message:"reset email sent"})

  } catch (error) {
    res.status(500)
    throw new Error("Email not send please try again")
    
  }

})

//reset password

const resetPassword= asyncHandler(async(req,res)=>{
  const {password}= req.body
  const {resetToken}=req.params

  
  // hash token, then compre to token in DB
  const hashedToken= crypto.createHash("sha256").update(resetToken).digest("hex")

  //find token in db

  const userToken=await Token.findOne({
    token: hashedToken,
    expiresAt:{$gt: Date.now()}// if greater than curent time

  })

  if(!userToken){
    res.status(404)
    throw new Error("invalid or expired token")


  }
  //find user

  const user=await User.findOne({_id: userToken.userId})
  user.password=password
  await user.save()
  res.status(200).json({
    message:"password reset successfull, please login"

  })




})


module.exports={
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    fogotPassword,
    resetPassword,
};