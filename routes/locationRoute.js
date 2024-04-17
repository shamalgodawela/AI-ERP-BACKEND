// routes/locationRoute.js

const express = require('express');
const router = express.Router();
const { saveLocation, getLiveLocations } = require('../controllers/locationController');

// Route to handle saving location data
router.post('/location', saveLocation);

// Route to fetch live user locations
router.get('/live-locations', getLiveLocations);

module.exports = router;
