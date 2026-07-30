const express = require('express');
const router = express.Router();
const accountController = require('../controllers/AccountController');
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");


// Create account
router.post('/', protect,authorize("account"), accountController.createAccount);

// Get all accounts
router.get('/',protect,authorize("account"), accountController.getAllAccounts);

// Get single account by ID
router.get('/:id', protect,authorize("account"), accountController.getAccountById);

// Update account by ID
router.put('/:id', protect,authorize("account"), accountController.updateAccount);

// Delete account by ID
router.delete('/:id', protect,authorize("account"), accountController.deleteAccount);

module.exports = router; 