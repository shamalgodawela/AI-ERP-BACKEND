const express= require('express');
const router=express.Router();
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");
const NewBulkDetails = require('../controllers/NewBulkDetails')


router.post('/addNewBulk', protect, authorize("user","admin","Operation","account"), NewBulkDetails.addBulkdetails);
router.get('/get-allbulk-details', protect, authorize("user","admin","Operation","account"), NewBulkDetails.getAllbulk)

module.exports=router;