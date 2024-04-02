const express = require('express');
const router = express.Router();
const { addStationery } = require('../controllers/stationeryuse');
const { getAllStationeryUse } = require('../controllers/stationeryuse');


router.post('/addstationeryuse', addStationery);
router.get('/getalluse', getAllStationeryUse);

module.exports = router;
