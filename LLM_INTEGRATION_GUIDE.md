# 🤖 Advanced LLM Integration for ERP System

## Overview

This ERP system now includes a sophisticated Large Language Model (LLM) integration that provides intelligent business insights, conversational AI, and advanced analytics capabilities.

## 🚀 Features

### 1. **Conversational AI**
- Natural language processing for business queries
- Context-aware conversations with memory
- Multi-turn dialogue support

### 2. **Advanced Analytics**
- Sales analytics with trend analysis
- Inventory insights with recommendations
- Customer behavior analysis
- Business intelligence reporting

### 3. **Predictive Capabilities**
- Trend prediction for sales and demand
- Inventory forecasting
- Revenue projections

### 4. **Security & Performance**
- Authentication required for all LLM requests
- Rate limiting (20 requests per 15 minutes)
- Input validation and sanitization
- Request timeout protection (45 seconds)

## 📡 API Endpoints

### 1. **LLM Conversation**
```http
POST /api/llm/conversation
Content-Type: application/json
Authorization: Bearer <token>

{
  "prompt": "Analyze my sales performance this month",
  "conversationId": "optional-conversation-id",
  "context": "optional-context"
}
```

**Response:**
```json
{
  "answer": "Sales Analytics for month:\nTotal Sales: Rs. 125,000\nNumber of Orders: 45\nTop Products: Product A (150), Product B (120)...",
  "type": "sales_analytics",
  "conversationId": "user_123_1703123456789",
  "data": {
    "period": "month",
    "currentSales": { "total": 125000, "count": 45 },
    "topProducts": [...]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. **Get Conversation History**
```http
GET /api/llm/conversation/:conversationId
Authorization: Bearer <token>
```

### 3. **Clear Conversation**
```http
DELETE /api/llm/conversation/:conversationId
Authorization: Bearer <token>
```

## 🎯 Available Functions

### 1. **Sales Analytics** (`getSalesAnalytics`)
```javascript
{
  "period": "today|week|month|quarter|year",
  "comparison": true|false
}
```

**Example Prompts:**
- "Show me sales analytics for this month"
- "Compare this week's sales with last week"
- "What are my quarterly sales trends?"

### 2. **Inventory Insights** (`getInventoryInsights`)
```javascript
{
  "category": "optional-category",
  "includeRecommendations": true|false
}
```

**Example Prompts:**
- "Give me inventory insights with recommendations"
- "Analyze electronics category inventory"
- "What items need restocking?"

### 3. **Customer Analytics** (`getCustomerAnalytics`)
```javascript
{
  "analysisType": "behavior|preferences|loyalty|segmentation"
}
```

**Example Prompts:**
- "Analyze customer behavior patterns"
- "Show me customer loyalty metrics"
- "What are my customer preferences?"

### 4. **Business Reports** (`generateBusinessReport`)
```javascript
{
  "reportType": "sales|inventory|financial|operational",
  "format": "summary|detailed|executive"
}
```

### 5. **Trend Prediction** (`predictTrends`)
```javascript
{
  "metric": "sales|demand|revenue|inventory",
  "timeframe": "week|month|quarter"
}
```

## 💡 Usage Examples

### Frontend Integration

```javascript
// Initialize conversation
let conversationId = null;

// Send message to LLM
async function sendToLLM(prompt) {
  try {
    const response = await fetch('/api/llm/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        prompt: prompt,
        conversationId: conversationId
      })
    });

    const data = await response.json();
    
    if (data.conversationId) {
      conversationId = data.conversationId;
    }
    
    return data;
  } catch (error) {
    console.error('LLM Error:', error);
  }
}

// Example usage
const result = await sendToLLM("What are my top selling products this month?");
console.log(result.answer);
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const LLMChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/llm/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt: input,
          conversationId: conversationId
        })
      });

      const data = await response.json();
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const aiMessage = { role: 'assistant', content: data.answer, type: data.type };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="llm-chat">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="content">{msg.content}</div>
            {msg.type && <div className="type">{msg.type}</div>}
          </div>
        ))}
        {loading && <div className="loading">AI is thinking...</div>}
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about sales, inventory, or business insights..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default LLMChat;
```

## 🔧 Configuration

### Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_connection_string
```

### Rate Limiting
- **Basic AI**: 10 requests per 15 minutes
- **Advanced LLM**: 20 requests per 15 minutes
- **Timeout**: 45 seconds per request

## 🛡️ Security Features

1. **Authentication Required**: All LLM endpoints require valid JWT tokens
2. **Input Validation**: Prompts are validated and sanitized
3. **Rate Limiting**: Prevents API abuse
4. **Error Handling**: Secure error messages without exposing internals
5. **Conversation Isolation**: Each user's conversations are isolated

## 📊 Monitoring & Analytics

The system logs:
- Successful LLM requests with function types
- Error rates and types
- User interaction patterns
- Performance metrics

## 🚀 Best Practices

1. **Conversation Management**
   - Use conversationId for multi-turn dialogues
   - Clear old conversations periodically
   - Handle conversation context appropriately

2. **Error Handling**
   - Implement retry logic for failed requests
   - Show user-friendly error messages
   - Log errors for debugging

3. **Performance**
   - Cache frequently requested data
   - Implement loading states
   - Use appropriate timeouts

4. **User Experience**
   - Provide clear prompts and examples
   - Show typing indicators
   - Display response types and data

## 🔮 Future Enhancements

1. **Advanced Analytics**
   - Real-time dashboard integration
   - Custom report generation
   - Predictive modeling

2. **Integration Features**
   - Email report generation
   - Slack/Teams integration
   - Mobile app support

3. **AI Capabilities**
   - Multi-language support
   - Voice interaction
   - Image analysis for inventory

## 📞 Support

For issues or questions about the LLM integration:
1. Check the logs for error details
2. Verify API key configuration
3. Test with simple prompts first
4. Monitor rate limit usage

---

**Note**: This LLM integration is designed to enhance your ERP system with intelligent insights while maintaining security and performance standards. 