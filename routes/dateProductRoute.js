const express = require('express');
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");
const { addProductAndUpdate, getAllDateProducts } = require('../controllers/dateproductController');

// Route to add a new product and update existing products based on category match
router.post('/dateProducts', protect, authorize("user","admin","Operation","account"), addProductAndUpdate);

// Route to get all dateProducts
router.get('/dateProducts', protect, authorize("user","admin","Operation","account"), getAllDateProducts);

module.exports = router;
