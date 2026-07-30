const express = require('express');
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");
const { addInventory, getAllInventories } = require('../controllers/InventoryController');

// Add inventory
router.post('/add-inventory', protect, authorize("user","admin","Operation","account"), addInventory);

// View all inventories
router.get('/all-inventories', protect, authorize("user","admin","Operation","account"), getAllInventories);

module.exports = router;
