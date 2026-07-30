const express= require("express");
const router=express.Router();
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");
const { contactUs } = require("../controllers/contactController");

router.post("/", protect, authorize("user","admin","Operation","account"), contactUs);

module.exports=router;