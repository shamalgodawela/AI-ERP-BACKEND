const express = require('express');
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");
const outstandingController = require('../controllers/outstandingController');


router.post('/create', protect, authorize("user","admin","Operation","account"), outstandingController.createOutstanding);


router.get('/get-outstanding/:invoiceNumber', protect, authorize("user","admin","Operation","account"), outstandingController.getOutstandingByInvoiceNumber);


router.get('/get-all-outstanding/:invoiceNumber', protect, authorize("user","admin","Operation","account"), outstandingController.getAllOutstandingByInvoiceNumber);
router.get('/get-last-outstanding/:invoiceNumber', protect, authorize("user","admin","Operation","account"), outstandingController.getLastOutstandingByInvoiceNumber);
router.get('/search-outstanding', protect, authorize("user","admin","Operation","account"), outstandingController.searchOutstanding);
router.get('/search-outstandingbycus', protect, authorize("user","admin","Operation","account"), outstandingController.searchOutstandingBycus);
router.get('/sumofcollection', protect, authorize("user","admin","Operation","account"), outstandingController.getSumOfOutstandingAmounts);
router.get('/collection-exe', protect, authorize("user","admin","Operation","account"), outstandingController.getExecutiveCollection);

router.get('/monthly-collection', protect, authorize("user","admin","Operation","account"), outstandingController.getMonthlyCollection);

router.get('/totalsales-and-collection-dealer', protect, authorize("user","admin","Operation","account"), outstandingController.getTotalSalesAndCollections);
router.get('/getmonthly-collection', protect, authorize("user","admin","Operation","account"), outstandingController.getMonthlyTotal)


router.get('/get-alldeposite-details', protect, authorize("user","admin","Operation","account"), outstandingController.getAllDeposite)

module.exports = router;

