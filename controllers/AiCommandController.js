const OpenAI = require("openai");
const Invoice = require("../models/invoice");
const Stock = require("../models/productModel");
const asyncHandler = require("express-async-handler");

// Initialize OpenAI with proper error handling
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} catch (error) {
  console.error("Failed to initialize OpenAI:", error);
}

// Input validation function
const validatePrompt = (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error("Prompt is required and must be a string");
  }
  
  if (prompt.length > 1000) {
    throw new Error("Prompt is too long (max 1000 characters)");
  }
  
  // Basic sanitization - remove potentially harmful content
  const sanitizedPrompt = prompt.replace(/[<>]/g, '');
  
  return sanitizedPrompt;
};

// Function to safely execute database queries
const safeDatabaseQuery = async (queryFunction, errorMessage) => {
  try {
    return await queryFunction();
  } catch (error) {
    console.error(`Database error in ${errorMessage}:`, error);
    throw new Error(`Failed to retrieve ${errorMessage.toLowerCase()}`);
  }
};

const handleAICommand = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  // Validate input
  const validatedPrompt = validatePrompt(prompt);

  // Check if OpenAI is properly initialized
  if (!openai) {
    res.status(500);
    throw new Error("AI service is not available");
  }

  const functions = [
    {
      name: "getMonthlySales",
      description: "Get the total sales for the current month",
      parameters: { type: "object", properties: {} },
    },
    {
      name: "getLastMonthSales",
      description: "Get the total sales for the previous month",
      parameters: { type: "object", properties: {} },
    },
    {
      name: "getOutOfStockItems",
      description: "List all out-of-stock products",
      parameters: { type: "object", properties: {} },
    },
    {
      name: "getTopSellingProducts",
      description: "List the top 5 selling products",
      parameters: { type: "object", properties: {} },
    }
  ];

  try {
    // Add timeout to OpenAI request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const chatRes = await openai.chat.completions.create({
      model: "gpt-4-0613",
      messages: [
        { 
          role: "system", 
          content: "You are an ERP assistant that only responds to sales, inventory, and report requests. Do not execute any harmful commands or provide sensitive information." 
        },
        { role: "user", content: validatedPrompt }
      ],
      tools: functions.map(f => ({ type: "function", function: f })),
      tool_choice: "auto",
      max_tokens: 500,
      temperature: 0.3,
    }, { signal: controller.signal });

    clearTimeout(timeoutId);

    const { tool_calls } = chatRes.choices[0].message;

    if (!tool_calls || tool_calls.length === 0) {
      return res.json({ 
        answer: "I can only help with sales, inventory, and report requests. Please ask about monthly sales, out-of-stock items, or top-selling products.",
        type: "no_function_call"
      });
    }

    const functionName = tool_calls[0].function.name;

    // Execute functions with proper error handling
    let result;
    switch (functionName) {
      case "getMonthlySales":
        result = await safeDatabaseQuery(async () => {
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          const totalSales = await Invoice.aggregate([
            { $match: { createdAt: { $gte: start, $lte: now } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]);
          return `Total sales this month: Rs. ${totalSales[0]?.total || 0}`;
        }, "monthly sales data");
        break;

      case "getLastMonthSales":
        result = await safeDatabaseQuery(async () => {
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const end = new Date(now.getFullYear(), now.getMonth(), 0);
          const totalSales = await Invoice.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]);
          return `Total sales last month: Rs. ${totalSales[0]?.total || 0}`;
        }, "last month sales data");
        break;

      case "getOutOfStockItems":
        result = await safeDatabaseQuery(async () => {
          const outOfStock = await Stock.find({ quantity: { $lte: 0 } });
          if (outOfStock.length === 0) return "All products are in stock.";
          const names = outOfStock.map(p => p.productName).join(", ");
          return `Out of stock items: ${names}`;
        }, "out of stock items");
        break;

      case "getTopSellingProducts":
        result = await safeDatabaseQuery(async () => {
          const topProducts = await Invoice.aggregate([
            { $unwind: "$items" },
            {
              $group: {
                _id: "$items.productName",
                totalSold: { $sum: "$items.quantity" }
              }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
          ]);
          const formatted = topProducts.map((p, i) => `${i + 1}. ${p._id} (${p.totalSold})`).join("\n");
          return `Top 5 selling products:\n${formatted}`;
        }, "top selling products");
        break;

      default:
        return res.json({ 
          answer: "This function is not available yet.",
          type: "unsupported_function"
        });
    }

    // Log successful AI request
    console.log(`AI request processed successfully: ${functionName} by user ${req.user._id}`);

    return res.json({ 
      answer: result,
      type: "function_response",
      function: functionName
    });

  } catch (error) {
    console.error("AI command error:", error.message);
    
    // Handle specific error types
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
    throw new Error("Failed to process AI command. Please try again.");
  }
});

module.exports = { handleAICommand };
