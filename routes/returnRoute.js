const express = require('express');
const router = express.Router();
const { addReturnDetails } = require('../controllers/returnController');

// Route to add return details
router.post('/addreturndetails', addReturnDetails);

module.exports = router;

