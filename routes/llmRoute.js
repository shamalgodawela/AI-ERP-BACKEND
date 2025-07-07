const express = require('express');
const router = express.Router();
const { 
  handleLLMRequest, 
  getConversationHistory, 
  clearConversation 
} = require('../controllers/LLMController');
const protect = require('../middleWare/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for LLM requests (more generous than basic AI)
const llmRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many LLM requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// LLM conversation route
router.post('/llm/conversation', protect, llmRateLimit, handleLLMRequest);

// Get conversation history
router.get('/llm/conversation/:conversationId', protect, getConversationHistory);

// Clear conversation history
router.delete('/llm/conversation/:conversationId?', protect, clearConversation);

// Additional LLM routes for specific functionality
router.post('/llm/chat', protect, llmRateLimit, handleLLMRequest);
router.post('/llm/analyze', protect, llmRateLimit, handleLLMRequest);
router.post('/llm/generate-report', protect, llmRateLimit, handleLLMRequest);

module.exports = router; 