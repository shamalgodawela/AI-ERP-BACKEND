const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/adminController');
const { loginUser } = require('../controllers/authController');
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");


router.post('/register/admin', protect,authorize("admin"), registerUser);
router.post('/login', protect,authorize("admin"), loginUser);

module.exports = router;
