const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.post('/add-invoice', invoiceController.addInvoice);
router.get('/get-all-invoices', invoiceController.getAllInvoices);
// get invoice details with last outstanding to admin operations and admin

router.get('/get-lastoutstanding-invoicedetails',invoiceController.getAllInvoicesWithOutstanding)
router.get('/get-invoicedetails-admin-outstanding',invoiceController.getAllInvoicesWithOutstandingadmin)

router.get('/get-invoice/:id', invoiceController.getInvoiceById);
router.post('/delete-invoice/:id', invoiceController.checkPassword, invoiceController.deleteInvoice);
router.get('/get-total-invoice-value/:code', invoiceController.getTotalInvoiceValueByCode);
router.get('/monthly-total-invoice/:code', invoiceController.getMonthlyTotalInvoice);
router.get('/lastInvoiceNumber',invoiceController.getLastInvoiceNumber);
router.get('/check/:orderNumber', invoiceController.checkOrderNumberExists);

router.get('/search-invoices', invoiceController.searchInvoices);
router.put('/invoices/:invoiceNumber', invoiceController.updateInvoice);
router.get('/invoices/:invoiceNumber', invoiceController.getInvoiceByNumber);

//get sales details
router.get('/invoi/sum', invoiceController.getSumByGatePassNo);
router.get('/monthlysales',invoiceController.getMonthlySales)
router.get('/monthlysalesbyexe',invoiceController.getMonthlySalesbyExe)
router.get('/salesbyExe',invoiceController.getSalesByExe)

router.get('/totalproduct', invoiceController.getTotalQuantityByProductCode)
router.get('/search-outstanding', invoiceController.getexeforoutstanding)


//search invoice
router.get('/search-invoice-by-executive/:code',invoiceController.searchInvoicesByExe)

//get total sales for each Delaer
router.get('/get-total-salesby-dealer/:code',invoiceController.gettotsalesByDealercode)


//search by product code

router.get('/search-by-productcode/:productCode',invoiceController.searchInvoicesByProductCode)

// get executives product wise sales 
router.get('/get-executives-sales-eachProduct/:exe',invoiceController.getProductWiseSalesByExe)





module.exports = router;
