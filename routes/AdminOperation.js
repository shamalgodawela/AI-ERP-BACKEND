const express = require('express');
const router = express.Router();
const { registerAdminOperation } = require('../controllers/AdminOperationController');
const { loginAdminOperation } = require('../controllers/authController');


router.post('/registerAdminOperation',registerAdminOperation );
router.post('/adminOperationlogin', loginAdminOperation);

module.exports = router;
