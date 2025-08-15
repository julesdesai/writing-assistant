const { OpenAI } = require('openai');

class OllamaService {
  constructor() {
    this.client = new OpenAI({
      baseURL: (process.env.OLLAMA_BASE_URL || 'http://localhost:11434') + '/v1',
      apiKey: 'ollama' // Dummy key for Ollama
    });
    this.model = process.env.OLLAMA_MODEL || 'gpt-oss:20b';
  }

  async isModelAvailable() {
    try {
      console.log(`Testing Ollama at: ${this.client.baseURL} with model: ${this.model}`);
      // Simple health check by attempting a minimal completion
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1
      });
      console.log('Ollama model available:', response.choices?.[0]?.message?.content || 'Success');
      return true;
    } catch (error) {
      console.error('Ollama model not available:', error.message);
      console.error('Full error:', error.response?.data || error);
      return false;
    }
  }

  async complete(messages, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 8000, // Very high for detailed responses - no API cost!
      stream = false
    } = options;

    try {
      console.log(`🤖 Starting completion with ${messages.length} messages, stream: ${stream}`);
      console.log(`🔢 Token settings: maxTokens=${maxTokens}, temperature=${temperature}`);
      
      const requestConfig = {
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream
      };
      
      console.log('📤 Sending request config:', JSON.stringify(requestConfig, null, 2));
      
      const response = await this.client.chat.completions.create(requestConfig);

      if (stream) {
        return response;
      }

      console.log('🔍 Full response structure:', JSON.stringify(response, null, 2));
      const choice = response.choices[0];
      console.log('🔍 First choice:', JSON.stringify(choice, null, 2));
      
      const content = choice?.message?.content || '';
      console.log(`✅ Completion finished: ${content.length} characters: "${content}"`);
      return content;
    } catch (error) {
      console.error('❌ Ollama completion error:', error);
      throw new Error(`Local inference failed: ${error.message}`);
    }
  }

  async completeStream(messages, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 8000 // Very high for detailed responses - no API cost!
    } = options;

    try {
      console.log(`🌊 Starting streaming completion with ${messages.length} messages`);
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true
      });

      console.log('📡 Stream created successfully');
      return stream;
    } catch (error) {
      console.error('❌ Ollama streaming error:', error);
      throw new Error(`Local streaming failed: ${error.message}`);
    }
  }
}

module.exports = new OllamaService();