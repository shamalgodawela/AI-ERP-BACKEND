const express=require("express");
const { exeregister } = require("../controllers/exeController");
const router=express.Router();

router.post('/exeregister', exeregister);


module.exports=router;