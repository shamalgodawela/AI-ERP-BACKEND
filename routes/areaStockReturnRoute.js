const express = require('express');
const router = express.Router();
const {
    addAreaStockReturn,
    getAllAreaStockReturns,
} = require('../controllers/areaStockReturnController');

router.post('/area-stock-returns', addAreaStockReturn);
router.get('/area-stock-returns', getAllAreaStockReturns);

module.exports = router;
