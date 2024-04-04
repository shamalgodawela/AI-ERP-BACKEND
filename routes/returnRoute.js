const express = require('express');
const router = express.Router();
const { addReturnDetails } = require('../controllers/returnController');
const { getAllReturnDetails } = require('../controllers/returnController');

// Route to add return details
router.post('/addreturndetails', addReturnDetails);
router.get('/getreturnd',getAllReturnDetails)

module.exports = router;

