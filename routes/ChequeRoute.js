const express = require('express');
const router = express.Router();
const ChequeController= require('../controllers/ChequeController');

router.post('/add-Cheque-Details', ChequeController.AddChequeDetails);

module.exports=router