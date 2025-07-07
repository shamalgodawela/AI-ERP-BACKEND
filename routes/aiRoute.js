const express = require('express');
const router = express.Router();
const { handleAICommand } = require('../controllers/AiCommandController');
const protect = require('../middleWare/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for AI requests
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many AI requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// AI command route with authentication and rate limiting
router.post('/ai/command', protect, aiRateLimit, handleAICommand);

module.exports = router; 