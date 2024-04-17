// routes/customerRoutes.js

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const protect = require('../middleWare/authMiddleware');

router.post('/customers', protect, customerController.createCustomer);
// Fetch all customers
router.get('/customers', protect, customerController.getCustomers);
// New route for getting a single customer by code
router.get('/customers/:code', customerController.getCustomerByCode);
router.patch('/customersup/:id', protect, customerController.updateCustomer);

//get customer by id

router.get('/customersn/:id', protect, customerController.getCustomerById);

router.delete('/customers/:id', protect, customerController.deleteCustomer);

module.exports = router;
