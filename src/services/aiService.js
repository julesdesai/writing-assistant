const AI_PROVIDERS = {
  OPENAI: 'openai',
  CLAUDE: 'claude'
};

class AIService {
  constructor() {
    this.defaultProvider = AI_PROVIDERS.OPENAI;
  }

  async callAPI(prompt, provider = this.defaultProvider, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 1000,
      model = null
    } = options;

    try {
      switch (provider) {
        case AI_PROVIDERS.OPENAI:
          return await this.callOpenAI(prompt, { temperature, maxTokens, model });
        case AI_PROVIDERS.CLAUDE:
          return await this.callClaude(prompt, { temperature, maxTokens, model });
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
    } catch (error) {
      console.error(`AI API call failed for provider ${provider}:`, error);
      throw error;
    }
  }

  async callOpenAI(prompt, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 1000,
      model = 'gpt-4'
    } = options;

    // Ensure we always have a model
    const actualModel = model || 'gpt-4';

    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set REACT_APP_OPENAI_API_KEY environment variable.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: actualModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async callClaude(prompt, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 1000,
      model = 'claude-3-sonnet-20240229'
    } = options;

    // Ensure we always have a model
    const actualModel = model || 'claude-3-sonnet-20240229';

    const apiKey = process.env.REACT_APP_CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('Claude API key not found. Please set REACT_APP_CLAUDE_API_KEY environment variable.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: actualModel,
        max_tokens: maxTokens,
        temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }

  setDefaultProvider(provider) {
    if (!Object.values(AI_PROVIDERS).includes(provider)) {
      throw new Error(`Invalid provider: ${provider}`);
    }
    this.defaultProvider = provider;
  }

  getAvailableProviders() {
    return Object.values(AI_PROVIDERS);
  }
}

export default new AIService();
export { AI_PROVIDERS };