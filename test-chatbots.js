const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';

// Test AI Command Controller
async function testAIController() {
  console.log('🤖 Testing AI Command Controller...');
  
  try {
    const response = await axios.post(`${BASE_URL}/ai/command`, {
      prompt: 'Hello, this is a test message'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ AI Controller Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ AI Controller Error:', error.response?.data || error.message);
    return false;
  }
}

// Test LLM Controller
async function testLLMController() {
  console.log('💬 Testing LLM Controller...');
  
  try {
    const response = await axios.post(`${BASE_URL}/llm/conversation`, {
      message: 'Hello, this is a test conversation'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ LLM Controller Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ LLM Controller Error:', error.response?.data || error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Chatbot Controller Tests...\n');
  
  const aiResult = await testAIController();
  console.log('');
  const llmResult = await testLLMController();
  
  console.log('\n📊 Test Results:');
  console.log(`AI Controller: ${aiResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`LLM Controller: ${llmResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (aiResult && llmResult) {
    console.log('\n🎉 Both controllers are working correctly!');
    console.log('Your chatbots should now be fully functional.');
  } else {
    console.log('\n⚠️  Some controllers have issues. Check the error messages above.');
  }
}

// Run the tests
runTests().catch(console.error); 