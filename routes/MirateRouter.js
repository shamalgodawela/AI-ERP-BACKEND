const express = require('express');
const { migrateData } = require('../controllers/DataMigration');

const router = express.Router();

// Route to handle data migration
router.get('/invoices-migrate', migrateData);

module.exports = router;
