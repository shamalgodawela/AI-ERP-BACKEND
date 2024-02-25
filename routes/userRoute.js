const express= require("express");
const { registerUser, loginUser, logout, getUser, loginStatus, updateUser, changePassword, fogotPassword, resetPassword } = require("../controllers/userConroller");
const protect = require("../middleWare/authMiddleware");
const router=express.Router();



router.post("/register", registerUser)
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/getuser", protect, getUser);
router.get("/loggedin",loginStatus)
router.patch("/updateuser",protect, updateUser);
router.patch("/changepassword",protect, changePassword);
router.post("/fogotpassword", fogotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

module.exports=router