const express = require('express');
const router = express.Router();
const TaxInvoiceController= require("../controllers/TaxInvoiceController")

router.get('/get-Tax-Invoices', TaxInvoiceController.getAllTaxInvoices);
router.get('/get-Taxinvoices/:invoiceNumber', TaxInvoiceController.getTaxInvoiceByNumber);
router.get('/searchTaxInvoice', TaxInvoiceController.searchTaxInvoices);


module.exports = router;