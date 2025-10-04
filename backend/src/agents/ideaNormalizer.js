import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createRetryingLLM, isNetworkError } from '../utils/apiHelper.js';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
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
    
    // Check for API key with better diagnostics
    if (!process.env.GEMINI_API_KEY) {
      console.error('Environment variables loaded:', Object.keys(process.env).filter(key => key.includes('API') || key.includes('KEY')).join(', '));
      console.error('GEMINI_API_KEY is missing. Please check your .env file and ensure it is being loaded correctly.');
      throw new Error('GEMINI_API_KEY environment variable is required for IdeaNormalizerAgent');
    }
    
    console.log('IdeaNormalizerAgent initialized with GEMINI_API_KEY successfully.');
    
    // Initialize LLM with retry logic
    try {
      const llm = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: 'gemini-pro',
        temperature: 0.2,
        maxRetries: 3, // Native retries from the library
      });
      
      // Add our custom retry logic
      this.llm = createRetryingLLM(llm, {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        onRetry: (err, attempt) => {
          console.warn(`Retry attempt ${attempt} connecting to Gemini API: ${err.message}`);
          
          if (isNetworkError(err)) {
            console.warn('Network error detected. This could be due to connectivity issues or rate limiting.');
          }
        }
      });
      
      console.log('IdeaNormalizerAgent LLM initialized successfully with retry logic.');
    } catch (error) {
      console.error('Failed to initialize Gemini LLM:', error.message);
      throw new Error(`Failed to initialize Gemini LLM: ${error.message}`);
    }
    
    // Create structured output parser
    this.outputParser = StructuredOutputParser.fromZodSchema(normalizedIdeaSchema);
    
    // Create prompt template
    this.normalizePrompt = PromptTemplate.fromTemplate(`
You are an expert at analyzing and structuring business ideas.

BUSINESS IDEA:
{idea}

Your task is to normalize this idea into a structured format. 
Extract the core concept and organize it clearly.

{format_instructions}

Think step-by-step:
1. Understand the core business concept
2. Identify the industry and target audience
3. Extract key features and value propositions
4. Generate relevant keywords
5. Create a concise title and clear description

IMPORTANT: Return ONLY the JSON structure with no additional text.
    `);
    
    // Create chain
    this.chain = RunnableSequence.from([
      {
        idea: (input) => input.idea,
        format_instructions: () => this.outputParser.getFormatInstructions(),
      },
      this.normalizePrompt,
      this.llm,
      new StringOutputParser(),
      this.outputParser,
    ]);
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
      // Run the chain with additional retry wrapper
      const result = await this.chain.invoke({
        idea: task.idea,
      }).catch(async (error) => {
        // If it's a network error, provide more specific info and retry with backoff
        if (isNetworkError(error)) {
          console.warn(`Network error when normalizing idea: ${error.message}`);
          this.emitEvent(taskId, 'warning', 'Network issue detected. Retrying connection to Gemini API...');
          
          // Wait a bit longer before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Try one more time with a simpler prompt
          return this.chain.invoke({
            idea: task.idea,
          });
        }
        throw error; // Re-throw if not a network error
      });
      
      // Emit result event
      this.emitEvent(
        taskId, 
        'normalized', 
        `Successfully normalized business idea: ${result.title}`,
        'normalized_idea'
      );

      return result;
    } catch (error) {
      console.error('Error in IdeaNormalizerAgent:', error);
      
      // Provide more specific error messages based on error type
      if (isNetworkError(error)) {
        const friendlyMessage = 'Network error connecting to AI services. Please check your internet connection and try again later.';
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
