const express = require('express');
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");
const { addReturnDetails } = require('../controllers/returnController');
const { getAllReturnDetails } = require('../controllers/returnController');

// Route to add return details
router.post('/addreturndetails', protect, authorize("user","admin","Operation","account"), addReturnDetails);
router.get('/getreturnd', protect, authorize("user","admin","Operation","account"), getAllReturnDetails)

module.exports = router;

