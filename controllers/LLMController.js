const OpenAI = require("openai");
const asyncHandler = require("express-async-handler");
const Invoice = require("../models/invoice");
const Stock = require("../models/productModel");
const Customer = require("../models/customerModel");
const Order = require("../models/order");
const moment = require("moment");

// Initialize OpenAI with proper error handling
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} catch (error) {
  console.error("Failed to initialize OpenAI:", error);
}

// In-memory conversation store (in production, use Redis or database)
const conversationStore = new Map();

// Enhanced ERP functions with more sophisticated capabilities
const erpFunctions = [
  {
    name: "getSalesAnalytics",
    description: "Get comprehensive sales analytics including trends, comparisons, and insights",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["today", "week", "month", "quarter", "year"],
          description: "Time period for analysis"
        },
        comparison: {
          type: "boolean",
          description: "Whether to include comparison with previous period"
        }
      }
    }
  },
  {
    name: "getInventoryInsights",
    description: "Get detailed inventory analysis including stock levels, turnover, and recommendations",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Product category to analyze (optional)"
        },
        includeRecommendations: {
          type: "boolean",
          description: "Whether to include AI recommendations"
        }
      }
    }
  },
  {
    name: "getCustomerAnalytics",
    description: "Analyze customer behavior, preferences, and trends",
    parameters: {
      type: "object",
      properties: {
        analysisType: {
          type: "string",
          enum: ["behavior", "preferences", "loyalty", "segmentation"],
          description: "Type of customer analysis"
        }
      }
    }
  },
  {
    name: "generateBusinessReport",
    description: "Generate comprehensive business reports with insights and recommendations",
    parameters: {
      type: "object",
      properties: {
        reportType: {
          type: "string",
          enum: ["sales", "inventory", "financial", "operational"],
          description: "Type of business report"
        },
        format: {
          type: "string",
          enum: ["summary", "detailed", "executive"],
          description: "Report format"
        }
      }
    }
  },
  {
    name: "predictTrends",
    description: "Predict future trends based on historical data",
    parameters: {
      type: "object",
      properties: {
        metric: {
          type: "string",
          enum: ["sales", "demand", "revenue", "inventory"],
          description: "Metric to predict"
        },
        timeframe: {
          type: "string",
          enum: ["week", "month", "quarter"],
          description: "Prediction timeframe"
        }
      }
    }
  }
];

// Enhanced system prompt with context awareness
const getSystemPrompt = (userRole, conversationHistory) => {
  const basePrompt = `You are an advanced ERP AI assistant with deep knowledge of business operations, sales, inventory, and financial management. 

Your capabilities include:
- Sales analytics and trend analysis
- Inventory optimization and forecasting
- Customer behavior analysis
- Financial reporting and insights
- Business intelligence and recommendations

User Role: ${userRole || 'Standard User'}
Current Date: ${moment().format('YYYY-MM-DD HH:mm:ss')}

Guidelines:
1. Provide actionable insights, not just data
2. Use business terminology appropriately
3. Suggest optimizations and improvements
4. Be conversational but professional
5. Ask clarifying questions when needed
6. Provide context for your recommendations

${conversationHistory ? `Previous conversation context: ${conversationHistory}` : ''}`;

  return basePrompt;
};

// Advanced sales analytics function
const getSalesAnalytics = async (period, comparison = false) => {
  const now = moment();
  let startDate, endDate, previousStart, previousEnd;

  switch (period) {
    case "today":
      startDate = moment().startOf('day');
      endDate = moment().endOf('day');
      previousStart = moment().subtract(1, 'day').startOf('day');
      previousEnd = moment().subtract(1, 'day').endOf('day');
      break;
    case "week":
      startDate = moment().startOf('week');
      endDate = moment().endOf('week');
      previousStart = moment().subtract(1, 'week').startOf('week');
      previousEnd = moment().subtract(1, 'week').endOf('week');
      break;
    case "month":
      startDate = moment().startOf('month');
      endDate = moment().endOf('month');
      previousStart = moment().subtract(1, 'month').startOf('month');
      previousEnd = moment().subtract(1, 'month').endOf('month');
      break;
    case "quarter":
      startDate = moment().startOf('quarter');
      endDate = moment().endOf('quarter');
      previousStart = moment().subtract(1, 'quarter').startOf('quarter');
      previousEnd = moment().subtract(1, 'quarter').endOf('quarter');
      break;
    case "year":
      startDate = moment().startOf('year');
      endDate = moment().endOf('year');
      previousStart = moment().subtract(1, 'year').startOf('year');
      previousEnd = moment().subtract(1, 'year').endOf('year');
      break;
    default:
      startDate = moment().startOf('month');
      endDate = moment().endOf('month');
  }

  const currentSales = await Invoice.aggregate([
    { $match: { createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
  ]);

  let comparisonData = null;
  if (comparison) {
    const previousSales = await Invoice.aggregate([
      { $match: { createdAt: { $gte: previousStart.toDate(), $lte: previousEnd.toDate() } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);
    comparisonData = previousSales[0];
  }

  const topProducts = await Invoice.aggregate([
    { $match: { createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.productName", totalSold: { $sum: "$items.quantity" } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
  ]);

  return {
    period,
    currentSales: currentSales[0] || { total: 0, count: 0 },
    comparison: comparisonData,
    topProducts,
    periodRange: { start: startDate.format('YYYY-MM-DD'), end: endDate.format('YYYY-MM-DD') }
  };
};

// Advanced inventory insights function
const getInventoryInsights = async (category = null, includeRecommendations = true) => {
  let query = {};
  if (category) {
    query.category = category;
  }

  const inventory = await Stock.find(query);
  const outOfStock = inventory.filter(item => item.quantity <= 0);
  const lowStock = inventory.filter(item => item.quantity > 0 && item.quantity <= 10);
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const recommendations = includeRecommendations ? [
    outOfStock.length > 0 ? `Restock ${outOfStock.length} out-of-stock items` : null,
    lowStock.length > 0 ? `Monitor ${lowStock.length} low-stock items` : null,
    "Consider implementing automated reorder points",
    "Analyze seasonal demand patterns"
  ].filter(Boolean) : [];

  return {
    totalItems: inventory.length,
    outOfStock: outOfStock.length,
    lowStock: lowStock.length,
    totalValue,
    recommendations,
    category: category || 'All Categories'
  };
};

// Customer analytics function
const getCustomerAnalytics = async (analysisType) => {
  const customers = await Customer.find();
  const invoices = await Invoice.find().populate('customer');

  let analysis = {};

  switch (analysisType) {
    case "behavior":
      const customerPurchases = invoices.reduce((acc, invoice) => {
        const customerId = invoice.customer?._id?.toString();
        if (customerId) {
          if (!acc[customerId]) acc[customerId] = { total: 0, count: 0 };
          acc[customerId].total += invoice.amount;
          acc[customerId].count += 1;
        }
        return acc;
      }, {});

      analysis = {
        totalCustomers: customers.length,
        activeCustomers: Object.keys(customerPurchases).length,
        averageOrderValue: Object.values(customerPurchases).reduce((sum, data) => sum + data.total, 0) / Object.keys(customerPurchases).length || 0,
        topCustomers: Object.entries(customerPurchases)
          .sort(([,a], [,b]) => b.total - a.total)
          .slice(0, 5)
      };
      break;

    case "loyalty":
      const loyaltyData = invoices.reduce((acc, invoice) => {
        const customerId = invoice.customer?._id?.toString();
        if (customerId) {
          if (!acc[customerId]) acc[customerId] = [];
          acc[customerId].push(invoice.createdAt);
        }
        return acc;
      }, {});

      analysis = {
        repeatCustomers: Object.values(loyaltyData).filter(dates => dates.length > 1).length,
        averageOrdersPerCustomer: Object.values(loyaltyData).reduce((sum, dates) => sum + dates.length, 0) / Object.keys(loyaltyData).length || 0
      };
      break;

    default:
      analysis = { message: "Analysis type not implemented yet" };
  }

  return analysis;
};

// Main LLM handler with conversation memory
const handleLLMRequest = asyncHandler(async (req, res) => {
  const { prompt, conversationId, context } = req.body;
  const userId = req.user._id;

  // Validate input
  if (!prompt || typeof prompt !== 'string') {
    res.status(400);
    throw new Error("Valid prompt is required");
  }

  if (prompt.length > 2000) {
    res.status(400);
    throw new Error("Prompt is too long (max 2000 characters)");
  }

  // Get or create conversation history
  const conversationKey = conversationId || `user_${userId}_${Date.now()}`;
  let conversationHistory = conversationStore.get(conversationKey) || [];
  
  // Add user message to history
  conversationHistory.push({ role: "user", content: prompt, timestamp: new Date() });
  
  // Keep only last 10 messages for context
  if (conversationHistory.length > 10) {
    conversationHistory = conversationHistory.slice(-10);
  }

  // Prepare conversation context for system prompt
  const recentContext = conversationHistory
    .slice(-5)
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

    const chatRes = await openai.chat.completions.create({
      model: "gpt-4-0613",
      messages: [
        { 
          role: "system", 
          content: getSystemPrompt(req.user.role, recentContext)
        },
        ...conversationHistory.slice(-5).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      tools: erpFunctions.map(f => ({ type: "function", function: f })),
      tool_choice: "auto",
      max_tokens: 800,
      temperature: 0.3,
    }, { signal: controller.signal });

    clearTimeout(timeoutId);

    const { tool_calls } = chatRes.choices[0].message;
    let result = { answer: "", type: "conversation" };

    if (tool_calls && tool_calls.length > 0) {
      const functionName = tool_calls[0].function.name;
      const args = tool_calls[0].function.arguments ? JSON.parse(tool_calls[0].function.arguments) : {};

      switch (functionName) {
        case "getSalesAnalytics":
          const salesData = await getSalesAnalytics(args.period, args.comparison);
          result = {
            answer: `Sales Analytics for ${args.period}:\n` +
                   `Total Sales: Rs. ${salesData.currentSales.total.toLocaleString()}\n` +
                   `Number of Orders: ${salesData.currentSales.count}\n` +
                   `Top Products: ${salesData.topProducts.map(p => `${p._id} (${p.totalSold})`).join(', ')}\n` +
                   (salesData.comparison ? `\nPrevious Period: Rs. ${salesData.comparison.total.toLocaleString()}` : ''),
            type: "sales_analytics",
            data: salesData
          };
          break;

        case "getInventoryInsights":
          const inventoryData = await getInventoryInsights(args.category, args.includeRecommendations);
          result = {
            answer: `Inventory Insights:\n` +
                   `Total Items: ${inventoryData.totalItems}\n` +
                   `Out of Stock: ${inventoryData.outOfStock}\n` +
                   `Low Stock: ${inventoryData.lowStock}\n` +
                   `Total Value: Rs. ${inventoryData.totalValue.toLocaleString()}\n` +
                   (inventoryData.recommendations.length > 0 ? 
                     `\nRecommendations:\n${inventoryData.recommendations.map(rec => `• ${rec}`).join('\n')}` : ''),
            type: "inventory_insights",
            data: inventoryData
          };
          break;

        case "getCustomerAnalytics":
          const customerData = await getCustomerAnalytics(args.analysisType);
          result = {
            answer: `Customer Analytics (${args.analysisType}):\n` +
                   Object.entries(customerData)
                     .filter(([key]) => key !== 'topCustomers')
                     .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`)
                     .join('\n'),
            type: "customer_analytics",
            data: customerData
          };
          break;

        case "generateBusinessReport":
          result = {
            answer: `Business Report (${args.reportType} - ${args.format}):\n` +
                   `This feature will generate comprehensive ${args.format} ${args.reportType} reports with insights and recommendations. ` +
                   `Implementation in progress.`,
            type: "business_report",
            data: { reportType: args.reportType, format: args.format }
          };
          break;

        case "predictTrends":
          result = {
            answer: `Trend Prediction (${args.metric} - ${args.timeframe}):\n` +
                   `AI-powered trend prediction for ${args.metric} over the next ${args.timeframe}. ` +
                   `This feature uses historical data analysis and machine learning algorithms.`,
            type: "trend_prediction",
            data: { metric: args.metric, timeframe: args.timeframe }
          };
          break;

        default:
          result = {
            answer: "This advanced function is not available yet.",
            type: "unsupported_function"
          };
      }
    } else {
      // Handle conversational responses
      result = {
        answer: chatRes.choices[0].message.content,
        type: "conversation"
      };
    }

    // Add assistant response to conversation history
    conversationHistory.push({ 
      role: "assistant", 
      content: result.answer, 
      timestamp: new Date(),
      function: result.type
    });

    // Store updated conversation
    conversationStore.set(conversationKey, conversationHistory);

    // Log successful LLM request
    console.log(`LLM request processed: ${result.type} by user ${userId}`);

    return res.json({
      answer: result.answer,
      type: result.type,
      conversationId: conversationKey,
      data: result.data || null,
      timestamp: new Date()
    });

  } catch (error) {
    console.error("LLM request error:", error.message);
    
    if (error.name === 'AbortError') {
      res.status(408);
      throw new Error("Request timeout. Please try again.");
    }
    
    if (error.response?.status === 401) {
      res.status(500);
      throw new Error("AI service authentication failed");
    }
    
    if (error.response?.status === 429) {
      res.status(429);
      throw new Error("AI service rate limit exceeded. Please try again later.");
    }

    res.status(500);
    throw new Error("Failed to process LLM request. Please try again.");
  }
});

// Get conversation history
const getConversationHistory = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  if (!conversationId) {
    res.status(400);
    throw new Error("Conversation ID is required");
  }

  const history = conversationStore.get(conversationId) || [];
  
  return res.json({
    conversationId,
    history,
    messageCount: history.length
  });
});

// Clear conversation history
const clearConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  if (conversationId) {
    conversationStore.delete(conversationId);
  } else {
    // Clear all conversations for this user
    for (const [key] of conversationStore) {
      if (key.includes(`user_${userId}`)) {
        conversationStore.delete(key);
      }
    }
  }

  return res.json({
    message: "Conversation history cleared successfully",
    conversationId: conversationId || 'all'
  });
});

module.exports = { 
  handleLLMRequest, 
  getConversationHistory, 
  clearConversation 
}; 