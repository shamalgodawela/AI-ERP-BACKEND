const express = require('express');
const router = express.Router();
const bulkproductcontroller = require('../controllers/bulkproductcontroller');
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");

// Route to add a new product
router.post('/addbulkproduct', protect,authorize("user"), bulkproductcontroller.addProduct);
router.get('/getallbulk', protect,authorize("user"), bulkproductcontroller.getAllProducts);

module.exports = router;
