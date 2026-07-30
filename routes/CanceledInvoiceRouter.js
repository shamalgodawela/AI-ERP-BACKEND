const express = require('express');
const router = express.Router();
const CanceledInvoiceController = require('../controllers/CanceledInvoiceController');
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");


router.post('/addCanceled-invoice', protect, authorize("user","admin","Operation","account"), CanceledInvoiceController.addCanceledInvoice);
router.get('/getallCancelInvoice', protect, authorize("user","admin","Operation","account"), CanceledInvoiceController.getAllCancelInvoice );
router.get('/getcancelbyid/:id', protect, authorize("user","admin","Operation","account"), CanceledInvoiceController.getCancelInvoiceById);
module.exports=router