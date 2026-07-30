const express = require('express');
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");
const { addStationery } = require('../controllers/stationeryuse');
const { getAllStationeryUse } = require('../controllers/stationeryuse');


router.post('/addstationeryuse', protect, authorize("user","admin","Operation","account"), addStationery);
router.get('/getalluse', protect, authorize("user","admin","Operation","account"), getAllStationeryUse);

module.exports = router;
