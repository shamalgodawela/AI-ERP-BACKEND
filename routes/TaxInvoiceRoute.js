const express = require('express');
const router = express.Router();
const TaxInvoiceController= require("../controllers/TaxInvoiceController")

router.get('/get-Tax-Invoices', TaxInvoiceController.getAllInvoices);
router.get('/get-Taxinvoices/:id', TaxInvoiceController.getInvoiceByNumber);


module.exports = router;