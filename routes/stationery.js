const express = require('express');
const router = express.Router();
const productController = require('../controllers/stationeryController');

router.post('/add/stationery', productController.createProduct);
router.get('/get/stationery', productController.getAllProducts);

module.exports = router;
