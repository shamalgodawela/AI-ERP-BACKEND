const express = require('express');
const router = express.Router();
const outstandingController = require('../controllers/outstandingController');


router.post('/create', outstandingController.createOutstanding);


router.get('/get-outstanding/:invoiceNumber', outstandingController.getOutstandingByInvoiceNumber);


router.get('/get-all-outstanding/:invoiceNumber', outstandingController.getAllOutstandingByInvoiceNumber);
router.get('/get-last-outstanding/:invoiceNumber', outstandingController.getLastOutstandingByInvoiceNumber);
router.get('/get-outstanding-statuses', outstandingController.getOutstandingStatuses);
router.get('/search-outstanding', outstandingController.searchOutstanding);
router.get('/search-outstandingbycus', outstandingController.searchOutstandingBycus);
router.get('/sumofcollection', outstandingController.getSumOfOutstandingAmounts);
router.get('/collection-exe', outstandingController.getExecutiveCollection);

router.get('/monthly-collection',outstandingController.getMonthlyCollection);

router.get('/totalsales-and-collection-dealer',outstandingController.getTotalSalesAndCollections);

module.exports = router;

