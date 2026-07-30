const express = require('express');
const router = express.Router();
const { registerAdminOperation } = require('../controllers/AdminOperationController');
const { loginAdminOperation } = require('../controllers/authController');
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");


router.post('/registerAdminOperation', protect,authorize("Operation"), registerAdminOperation );
router.post('/adminOperationlogin', loginAdminOperation);

module.exports = router;   