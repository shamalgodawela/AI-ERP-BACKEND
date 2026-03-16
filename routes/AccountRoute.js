const express = require('express');
const router = express.Router();
const accountController = require('../controllers/AccountController');

// Create account
router.post('/', accountController.createAccount);

// Get all accounts
router.get('/', accountController.getAllAccounts);

// Get single account by ID
router.get('/:id', accountController.getAccountById);

// Update account by ID
router.put('/:id', accountController.updateAccount);

// Delete account by ID
router.delete('/:id', accountController.deleteAccount);

module.exports = router;