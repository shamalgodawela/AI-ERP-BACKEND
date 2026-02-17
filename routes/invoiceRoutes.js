const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.post('/add-invoice', invoiceController.addInvoice);
router.get('/get-all-invoices', invoiceController.getAllInvoices);


router.get('/get-lastoutstanding-invoicedetails',invoiceController.getAllInvoicesWithOutstanding)
router.get('/get-invoicedetails-admin-outstanding',invoiceController.getAllInvoicesWithOutstandingadmin)

router.get('/get-invoice/:id', invoiceController.getInvoiceById);
router.post('/delete-invoice/:id', invoiceController.checkPassword, invoiceController.deleteInvoice);
router.get('/get-total-invoice-value/:code', invoiceController.getTotalInvoiceValueByCode);
router.get('/monthly-total-invoice/:code', invoiceController.getMonthlyTotalInvoice);
router.get('/check/:orderNumber', invoiceController.checkOrderNumberExists);

router.get('/search-invoices', invoiceController.searchInvoices);
router.put('/invoices/:invoiceNumber', invoiceController.updateInvoice);
router.get('/invoices/:invoiceNumber', invoiceController.getInvoiceByNumber);

//get sales details
router.get('/monthlysales',invoiceController.getMonthlySales)
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



//fetch all last invoice number
router.get('/get-last-invoice-number-EA1', invoiceController.getLastInvoiceNumberEA1);
router.get('/get-last-invoice-number-NUM', invoiceController.getLastInvoiceNumberNUM);
router.get('/get-last-invoice-number-PT1', invoiceController.getLastInvoiceNumberPT1);
router.get('/get-last-invoice-number-KU1', invoiceController.getLastInvoiceNumberKU1);
router.get('/get-last-invoice-number-ncp1', invoiceController.getLastInvoiceNumberNCP1);
router.get('/get-last-invoice-number-upcountry', invoiceController.getLastInvoiceNumberUpcountry);
router.get('/get-last-invoice-number-other', invoiceController.getLastInvoiceNumberother);
router.get('/get-last-invoice-number-SOUTH1', invoiceController.getLastInvoiceNumberSOUTH1);





router.get('/get-last-TaxNo', invoiceController.getlastTaxNo);


//get exeincentive
router.get('/get-incentive', invoiceController.ExecutivesIncentive);


//get last tax no
router.get('/get-last-tax-no', invoiceController.getLastTaxNo);

//get product quantities by product code with date filtering
router.get('/get-product-quantity-by-code', invoiceController.getProductQuantityByCode);


//update invoice status
router.put('/invoices/cheque-status/:invoiceNumber', invoiceController.updateChequeStatus);
router.put('/invoices/cheque-deposit-date/:invoiceNumber', invoiceController.updateChequeDepositDate);
router.put('/invoices/cheque-amount/:invoiceNumber', invoiceController.updateChequeAmount);
router.get('/cheques', invoiceController.getAllChequeDetails);









module.exports = router;
