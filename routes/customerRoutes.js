// routes/customerRoutes.js

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const protect = require('../middleWare/authMiddleware');
const authorize = require('../middleWare/authorize');
const protectexe = require('../middleWare2/authMiddleware1');

router.post('/customers', protect, authorize("user","admin","Operation","account"), customerController.createCustomer);
// Fetch all customers
router.get('/customers', protect, authorize("user","admin","Operation","account"), customerController.getCustomers);
// New route for getting a single customer by code
router.get('/customers/:code', protect, authorize("user","admin","Operation","account"), customerController.getCustomerByCode);
router.patch('/customersup/:id', protect, authorize("user","admin","Operation","account"), customerController.updateCustomer);

//get customer by id

router.get('/customersn/:id', protect, authorize("user","admin","Operation","account"), customerController.getCustomerById);

router.delete('/customers/:id', protect, authorize("user","admin","Operation","account"), customerController.deleteCustomer);

module.exports = router;
