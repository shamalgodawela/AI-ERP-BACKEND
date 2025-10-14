const express = require('express');
const router = express.Router();
const { addInventory, getAllInventories } = require('../controllers/InventoryController');

// Add inventory
router.post('/add-inventory', addInventory);

// View all inventories
router.get('/all-inventories', getAllInventories);

module.exports = router;
