const express = require('express');
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");
const productController = require('../controllers/stationeryController');

router.post('/add/stationery', protect, authorize("user","admin","Operation","account"), productController.createProduct);
router.get('/get/stationery', protect, authorize("user","admin","Operation","account"), productController.getAllProducts);

module.exports = router;
