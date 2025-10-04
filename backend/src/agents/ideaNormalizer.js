import getCerebrasService from '../services/cerebrasService.js';
import { z } from 'zod';
import { BaseAgent } from './baseAgent.js';
import { AGENT_IDS } from './schema/agentSchema.js';

/**
 * Schema for normalized idea output
 */
const normalizedIdeaSchema = z.object({
  title: z.string().describe('A concise title for the business idea (5-10 words)'),
  description: z.string().describe('A clear, detailed description of the business idea (1-3 sentences)'),
  industry: z.string().describe('The primary industry this business operates in'),
  targetAudience: z.string().describe('The primary target audience or customer segment'),
  keyFeatures: z.array(z.string()).describe('3-5 key features or value propositions'),
  keywords: z.array(z.string()).describe('5-8 relevant keywords for this business idea'),
});

/**
 * Agent that normalizes a raw business idea into a structured format
 */
export class IdeaNormalizerAgent extends BaseAgent {
  constructor() {
    super(AGENT_IDS.IDEA_NORMALIZER);
    
    // Check for Cerebras API key
    if (!process.env.CEREBRAS_API_URL) {
      console.error('Environment variables loaded:', Object.keys(process.env).filter(key => key.includes('API') || key.includes('KEY')).join(', '));
      console.error('CEREBRAS_API_URL is missing. Please check your .env file and ensure it is being loaded correctly.');
      throw new Error('CEREBRAS_API_URL environment variable is required for IdeaNormalizerAgent');
    }
    
    console.log('IdeaNormalizerAgent initialized with CEREBRAS_API_URL successfully.');
    
    // Initialize Cerebras service
    this.cerebrasService = getCerebrasService();
    
    console.log('IdeaNormalizerAgent Cerebras service initialized successfully.');
  }

  /**
   * Process the raw idea
   * @param {Object} task - Task containing the raw idea
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} - Normalized idea structure
   */
  async process(task, taskId) {
    if (!task.idea || typeof task.idea !== 'string') {
      throw new Error('Invalid input: idea must be a string');
    }

    // Emit event
    this.emitEvent(taskId, 'normalizing', 'Normalizing business idea structure');

    try {
      // Create the system prompt for idea normalization
      const systemPrompt = `You are an expert at analyzing and structuring business ideas.

Your task is to normalize business ideas into a structured format. 
Extract the core concept and organize it clearly.

Think step-by-step:
1. Understand the core business concept
2. Identify the industry and target audience
3. Extract key features and value propositions
4. Generate relevant keywords
5. Create a concise title and clear description

IMPORTANT: Return ONLY a valid JSON structure with these exact fields:
{
  "title": "A concise title for the business idea (5-10 words)",
  "description": "A clear, detailed description of the business idea (1-3 sentences)",
  "industry": "The primary industry this business operates in",
  "targetAudience": "The primary target audience or customer segment",
  "keyFeatures": ["3-5 key features or value propositions"],
  "keywords": ["5-8 relevant keywords for this business idea"]
}

Do not include any additional text, explanations, or markdown formatting.`;

      // Create user input with the idea
      const userInput = `BUSINESS IDEA TO ANALYZE:\n${task.idea}`;

      // Use Cerebras service to generate structured output
      const response = await this.cerebrasService.generateStructuredOutput(
        systemPrompt,
        userInput,
        { temperature: 0.2 }
      );

      // Parse the JSON response
      let result;
      try {
        // Clean the response to extract JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('Error parsing Cerebras response:', parseError);
        console.error('Raw response:', response);
        
        // Fallback: create a basic structure
        result = {
          title: 'Business Idea',
          description: task.idea.substring(0, 200) + '...',
          industry: 'Technology',
          targetAudience: 'General consumers',
          keyFeatures: ['Innovative solution', 'User-friendly', 'Scalable'],
          keywords: ['business', 'innovation', 'technology', 'solution', 'market']
        };
      }

      // Validate the result against our schema
      const validatedResult = normalizedIdeaSchema.parse(result);
      
      // Emit result event
      this.emitEvent(
        taskId, 
        'normalized', 
        `Successfully normalized business idea: ${validatedResult.title}`,
        'normalized_idea'
      );

      return validatedResult;
    } catch (error) {
      console.error('Error in IdeaNormalizerAgent:', error);
      
      // Provide more specific error messages based on error type
      if (error.message.includes('Cerebras API error')) {
        const friendlyMessage = 'Error connecting to AI services. Please try again later.';
        this.emitEvent(taskId, 'error', friendlyMessage);
        throw new Error(friendlyMessage);
      } else if (error.message.includes('rate limit')) {
        const friendlyMessage = 'Rate limit reached for AI services. Please try again in a few minutes.';
        this.emitEvent(taskId, 'error', friendlyMessage);
        throw new Error(friendlyMessage);
      } else {
        this.emitEvent(taskId, 'error', `Error normalizing idea: ${error.message}`);
        throw error;
      }
    }
  }
}
