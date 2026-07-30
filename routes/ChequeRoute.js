const express = require('express');
const router = express.Router();
const ChequeController= require('../controllers/ChequeController');
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");

router.post('/add-Cheque-Details', protect, authorize("user","admin","Operation","account"), ChequeController.AddChequeDetails);
router.get('/getall-cheque', protect, authorize("user","admin","Operation","account"), ChequeController.GetAllCheques);
router.get('/get-single-Cheque/:id', protect, authorize("user","admin","Operation","account"), ChequeController.GetSingleCheque);
router.put('/edit-Cheque-Details/:id', protect, authorize("user","admin","Operation","account"), ChequeController.EditChequeDetails);

module.exports=router