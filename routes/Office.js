const express = require('express');
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");
const officeInventoryController = require('../controllers/officeController');

// Route for adding Office Inventory details
router.post('/addoffice', protect, authorize("user","admin","Operation","account"), officeInventoryController.addOfficeInventory);
router.get('/alloffice', protect, authorize("user","admin","Operation","account"), officeInventoryController.getAllOfficeInventory);

module.exports = router;
