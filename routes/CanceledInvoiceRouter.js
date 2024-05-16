const express = require('express');
const router = express.Router();
const CanceledInvoiceController = require('../controllers/CanceledInvoiceController');


router.post('/addCanceled-invoice', CanceledInvoiceController.addCanceledInvoice);
router.get('/getallCancelInvoice',CanceledInvoiceController.getAllCancelInvoice )
router.get('/getcancelbyid/:id',CanceledInvoiceController.getCancelInvoiceById)
module.exports=router