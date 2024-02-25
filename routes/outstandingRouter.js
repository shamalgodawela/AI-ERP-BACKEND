const express = require('express');
const router = express.Router();
const outstandingController = require('../controllers/outstandingController');

// Route to create outstanding data
router.post('/create', outstandingController.createOutstanding);

// Route to fetch outstanding details by invoice number
router.get('/get-outstanding/:invoiceNumber', outstandingController.getOutstandingByInvoiceNumber);

// Route to fetch all outstanding details for a specific invoice number
router.get('/get-all-outstanding/:invoiceNumber', outstandingController.getAllOutstandingByInvoiceNumber);
router.get('/get-last-outstanding/:invoiceNumber', outstandingController.getLastOutstandingByInvoiceNumber);
router.get('/get-outstanding-statuses', outstandingController.getOutstandingStatuses);

module.exports = router;

