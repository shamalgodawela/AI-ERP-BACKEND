const express = require('express');
const router = express.Router();
const ChequeController= require('../controllers/ChequeController');

router.post('/add-Cheque-Details', ChequeController.AddChequeDetails);
router.get('/getall-cheque', ChequeController.GetAllCheques);
router.get('/get-single-Cheque/:id', ChequeController.GetSingleCheque);
router.put('/edit-Cheque-Details/:id', ChequeController.EditChequeDetails);

module.exports=router