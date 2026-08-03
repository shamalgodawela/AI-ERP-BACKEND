const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { loginUser } = require('../controllers/authController');
const protect = require("../middleWare/authMiddleware");
const authorize = require("../middleWare/authorize");


router.post('/register/admin', protect,authorize("admin"), adminController.registerUser);
router.post('/login', protect,authorize("admin"), loginUser);
router.get('/get-all-users', protect, authorize("admin"), adminController.getAllUsers);

module.exports = router;
