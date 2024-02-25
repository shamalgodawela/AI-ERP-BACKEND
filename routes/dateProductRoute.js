const express = require('express');
const router = express.Router();
const { addProductAndUpdate, getAllDateProducts } = require('../controllers/dateproductController');

// Route to add a new product and update existing products based on category match
router.post('/dateProducts', addProductAndUpdate);

// Route to get all dateProducts
router.get('/dateProducts', getAllDateProducts);

module.exports = router;
