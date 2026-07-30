const express = require('express');
const router = express.Router();
const {
    addAreaStockReturn,
    getAllAreaStockReturns,
} = require('../controllers/areaStockReturnController');

const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");

router.post('/area-stock-returns', protect,authorize("user"), addAreaStockReturn);
router.get('/area-stock-returns', protect,authorize("user"), getAllAreaStockReturns);

module.exports = router;
