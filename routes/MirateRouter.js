const express = require('express');
const { migrateData } = require('../controllers/DataMigration');
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");

const router = express.Router();

// Route to handle data migration
router.get('/invoices-migrate', protect, authorize("admin","Operation"), migrateData);

module.exports = router;
