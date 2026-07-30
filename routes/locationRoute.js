// routes/locationRoute.js

const express = require('express');
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");
const { saveLocation, getLiveLocations } = require('../controllers/locationController');

// Route to handle saving location data
router.post('/location', protect, authorize("user","admin","Operation","account"), saveLocation);

// Route to fetch live user locations
router.get('/live-locations', protect, authorize("user","admin","Operation","account"), getLiveLocations);

module.exports = router;
