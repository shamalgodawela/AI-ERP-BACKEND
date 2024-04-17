const express = require('express');
const router = express.Router();
const executiveController = require('../controllers/executiveController');


router.post('/register/reg', executiveController.register);

router.post('/login/log', executiveController.login);

module.exports = router;
