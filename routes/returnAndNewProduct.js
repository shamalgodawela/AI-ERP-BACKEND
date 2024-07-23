const express = require('express');
const router = express.Router();
const oldReturninvoice=require('../controllers/oldReturninvoice');

router.post('/addRAndNProduct',oldReturninvoice.addProductAndreturn);

module.exports = router;