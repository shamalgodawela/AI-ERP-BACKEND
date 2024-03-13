const express = require('express');
const router = express.Router();
const bulkproductcontroller = require('../controllers/bulkproductcontroller');

// Route to add a new product
router.post('/addbulkproduct', bulkproductcontroller.addProduct);
router.get('/getallbulk', bulkproductcontroller.getAllProducts);

module.exports = router;
