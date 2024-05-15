const express = require('express');
const router = express.Router();
const CanceledInvoiceController = require('../controllers/CanceledInvoiceController');


router.post('/addCanceled-invoice', CanceledInvoiceController.addCanceledInvoice);

module.exports=router