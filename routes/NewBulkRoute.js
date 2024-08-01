const express= require('express');
const router=express.Router();
const NewBulkDetails = require('../controllers/NewBulkDetails')


router.post('/addNewBulk',NewBulkDetails.addBulkdetails);
router.get('/get-allbulk-details',NewBulkDetails.getAllbulk)

module.exports=router;