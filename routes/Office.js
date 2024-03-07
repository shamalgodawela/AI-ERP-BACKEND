const express = require('express');
const router = express.Router();
const officeInventoryController = require('../controllers/officeController');

// Route for adding Office Inventory details
router.post('/addoffice', officeInventoryController.addOfficeInventory);
router.get('/alloffice', officeInventoryController.getAllOfficeInventory);

module.exports = router;
