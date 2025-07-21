import aiService from '../services/aiService';
import { intellectualCriticPrompt } from '../prompts';

export const analyzeText = async (content, purpose) => {
  if (!content || content.length < 50) {
    return null;
  }

  try {
    const prompt = intellectualCriticPrompt(content, purpose);
    const response = await aiService.callAPI(prompt, undefined, {
      temperature: 0.3,
      maxTokens: 800
    });

    // Clean and parse JSON response
    try {
      // Remove any markdown code blocks or extra text
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Find JSON object in response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      const feedback = JSON.parse(cleanResponse);
      return Array.isArray(feedback) ? feedback : [feedback];
    } catch (parseError) {
      // If JSON parsing fails, create a fallback response
      console.warn('Failed to parse AI response as JSON:', parseError);
      console.log('Raw response:', response);
      return [{
        type: 'intellectual',
        severity: 'medium',
        title: 'AI Analysis',
        feedback: response.substring(0, 200) + (response.length > 200 ? '...' : ''),
        suggestion: 'Review the feedback and consider the suggested improvements.',
        position: { start: 0, end: Math.min(content.length, 100) }
      }];
    }
  } catch (error) {
    console.error('Intellectual critic analysis failed:', error);
    
    // Fallback to mock analysis if API fails
    return [{
      type: 'intellectual',
      severity: 'low',
      title: 'Analysis Unavailable', 
      feedback: 'Unable to connect to AI service. Please check your API configuration.',
      suggestion: 'Verify your API keys are set correctly in environment variables.',
      position: { start: 0, end: 50 }
    }];
  }
};