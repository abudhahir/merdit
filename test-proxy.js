// Simple test script for the proxy server
import fetch from 'node-fetch';

async function testProxy() {
  try {
    console.log('🧪 Testing proxy server...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test with a dummy API key (this will fail but should show proper error handling)
    console.log('🔑 Testing API endpoint with dummy key...');
    const testResponse = await fetch('http://localhost:3001/api/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: 'sk-dummy-key-for-testing',
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ],
        max_tokens: 10
      }),
    });
    
    const testData = await testResponse.json();
    console.log('📊 Test response status:', testResponse.status);
    console.log('📋 Response:', testData);
    
    if (testResponse.status === 401) {
      console.log('✅ Proxy is working! (401 = Invalid API key, which is expected)');
    } else {
      console.log('❓ Unexpected response - check proxy configuration');
    }
    
  } catch (error) {
    console.error('❌ Proxy test failed:', error.message);
    console.log('💡 Make sure the proxy server is running: npm run proxy');
  }
}

testProxy();