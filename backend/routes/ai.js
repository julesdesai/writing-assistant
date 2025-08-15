const express = require('express');
const ollamaService = require('../services/ollamaService');

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const isAvailable = await ollamaService.isModelAvailable();
    res.json({
      status: 'ok',
      localInference: isAvailable,
      model: process.env.OLLAMA_MODEL || 'gpt-oss:20b'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      localInference: false
    });
  }
});

// Simple test endpoint
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Running simple test...');
    const response = await ollamaService.complete([
      { role: 'user', content: 'Say "Hello, this is a test!" and nothing else.' }
    ], { maxTokens: 50 });
    
    res.json({
      success: true,
      response,
      length: response.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test streaming endpoint
router.get('/test-stream', async (req, res) => {
  try {
    console.log('🌊 Running streaming test...');
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const stream = await ollamaService.completeStream([
      { role: 'user', content: 'Say "Hello, this is a test!" and nothing else.' }
    ], { maxTokens: 50 });
    
    let chunkCount = 0;
    let reasoningContent = '';
    let finalContent = '';
    
    for await (const chunk of stream) {
      chunkCount++;
      const delta = chunk.choices[0]?.delta;
      const reasoning = delta?.reasoning || '';
      const content = delta?.content || '';
      
      if (reasoning) reasoningContent += reasoning;
      if (content) finalContent += content;
      
      // Send progress to client
      res.write(`Chunk ${chunkCount}: reasoning="${reasoning}" content="${content}"\n`);
      
      if (chunkCount > 20) break; // Limit for testing
    }
    
    res.write(`\nFinal: reasoning_length=${reasoningContent.length}, content_length=${finalContent.length}\n`);
    res.write(`Reasoning: "${reasoningContent}"\n`);
    res.write(`Content: "${finalContent}"\n`);
    res.end();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Chat completion endpoint (OpenAI-compatible)
router.post('/chat/completions', async (req, res) => {
  try {
    const { messages, temperature, max_tokens: maxTokens, stream } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Messages array is required'
      });
    }

    // Debug the incoming prompt
    console.log('📝 Incoming request:');
    console.log('- Messages:', messages.length);
    console.log('- Stream:', stream);
    console.log('- Temperature:', temperature);
    console.log('- Max tokens:', maxTokens);
    
    // Show the actual prompt (truncate if very long)
    messages.forEach((msg, i) => {
      const content = msg.content.length > 500 ? msg.content.substring(0, 500) + '...' : msg.content;
      console.log(`- Message ${i+1} (${msg.role}): ${content}`);
    });

    if (stream) {
      // For reasoning models like gpt-oss, streaming only shows reasoning, not final content
      // Fall back to non-streaming and simulate streaming response
      console.log('🔄 Converting to non-streaming for reasoning model...');
      
      const content = await ollamaService.complete(messages, {
        temperature,
        maxTokens
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Simulate streaming by sending the content in chunks
      const words = content.split(' ');
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '');
        
        res.write(`data: ${JSON.stringify({
          choices: [{
            delta: {
              content: word
            }
          }]
        })}\n\n`);
        
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // Handle non-streaming response
      console.log('📝 Processing non-streaming request...');
      const content = await ollamaService.complete(messages, {
        temperature,
        maxTokens
      });

      console.log(`✅ Non-streaming response: ${content.length} characters`);
      res.json({
        choices: [{
          message: {
            role: 'assistant',
            content
          }
        }]
      });
    }
  } catch (error) {
    console.error('AI completion error:', error);
    res.status(500).json({
      error: {
        message: error.message,
        type: 'local_inference_error'
      }
    });
  }
});

module.exports = router;