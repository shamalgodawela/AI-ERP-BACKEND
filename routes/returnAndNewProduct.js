const express = require('express');
const router = express.Router();
const oldReturninvoice=require('../controllers/oldReturninvoice');

router.post('/addRAndNProduct',oldReturninvoice.addProductAndreturn);
router.get('/get-alldetail-return',oldReturninvoice.veiewallProductdetails)

module.exports = router;