const express = require('express');
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");
const oldReturninvoice=require('../controllers/oldReturninvoice');

router.post('/addRAndNProduct', protect, authorize("user","admin","Operation","account"), oldReturninvoice.addProductAndreturn);
router.get('/get-alldetail-return', protect, authorize("user","admin","Operation","account"), oldReturninvoice.veiewallProductdetails)

module.exports = router;