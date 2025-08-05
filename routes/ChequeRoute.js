const express = require('express');
const router = express.Router();
const ChequeController= require('../controllers/ChequeController');

router.post('/add-Cheque-Details', ChequeController.AddChequeDetails);
router.get('/getall-cheque', ChequeController.GetAllCheques);

module.exports=router