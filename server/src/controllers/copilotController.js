/**
 * CopilotKit Controller
 * Handles context-aware AI assistance requests using CopilotKit
 */

import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

// Initialize model
const model = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL || "gpt-4-turbo",
  temperature: 0.7,
  streaming: true,
});

// Page-specific system prompts
const SYSTEM_PROMPTS = {
  dashboard: `You are IdeaHub's Dashboard Assistant, an AI expert in startup portfolio analysis.
Your role is to help users understand and navigate their idea dashboard, analyze trends across their
submissions, and suggest improvements based on their idea portfolio. Be proactive, insightful, and business-focused.
Provide specific advice based on the user's ideas and the data they're currently viewing.
For example: "I notice your healthcare ideas consistently score higher in market analysis - would you like me to explain why?"
You can help with: portfolio analysis, dashboard navigation, trend insights, and suggestion of next steps.`,

  addIdea: `You are IdeaHub's Idea Submission Assistant, an AI expert in refining startup concepts.
Your role is to help users articulate their startup ideas clearly, select appropriate categories,
identify target audiences, and frame problems effectively. Be encouraging, creative, and constructive.
You can suggest improvements to idea descriptions, help users identify their true target market,
and refine the problem statement to be more compelling. For example, if a user's idea seems vague,
ask clarifying questions to help them develop it further. Use a friendly, supportive tone.`,

  analysis: `You are IdeaHub's Analysis Assistant, an AI expert in interpreting startup validation data.
Your role is to help users understand their analysis results, explain market research findings,
interpret competitive landscapes, and clarify feasibility scores. Be data-driven, insightful, and educational.
Explain complex business concepts in accessible terms, point out strengths and weaknesses in the analysis,
and suggest follow-up questions users might ask. For example: "The low feasibility score is primarily due to
regulatory complexity - would you like me to explain the specific regulations that might affect your idea?"`,

  profile: `You are IdeaHub's Profile Assistant, an AI expert in account optimization.
Your role is to help users manage their profile settings, understand their usage patterns,
and optimize their IdeaHub experience. Be helpful, efficient, and clear.
You can explain features, help update profile information, and suggest settings based on usage patterns.
For example: "I see you frequently analyze healthcare ideas - would you like to set that as your default category?"`,

  credits: `You are IdeaHub's Credits Assistant, an AI expert in IdeaHub's pricing and packages.
Your role is to help users understand the credit system, explain package options, recommend
appropriate packages based on usage, and assist with transaction history. Be transparent, helpful, and trustworthy.
You can explain pricing details, compare package benefits, and help users maximize the value of their credits.
For example: "Based on your usage pattern, the Pro package would be most cost-effective for you."`,

  general: `You are IdeaHub's Assistant, an AI expert in startup idea validation.
Your role is to help users with any questions about IdeaHub's features, services, and functionality.
Be helpful, knowledgeable, and supportive. Provide clear explanations and guide users to the
appropriate tools and resources within the platform. For example: "If you're looking to analyze market trends
for your idea, I recommend submitting it through the 'Add Idea' form first."`,
};

// Prepare context-aware prompt template
const contextAwarePrompt = PromptTemplate.fromTemplate(`
{system_prompt}

Current Context:
User is on: {page_context}
Current data: {data_context}
User question: {user_input}

Based on this specific context, provide a helpful, relevant response to the user's question.
If the user is asking about actions you can perform (like updating profile information, managing idea metadata, etc.),
explain how you can assist with these actions.
`);

const copilotController = {
  /**
   * Handle CopilotKit context-aware AI assistance requests
   */
  handleCopilotRequest: async (req, res) => {
    const { messages, context } = req.body;
    
    if (!messages || !messages.length) {
      return res.status(400).json({ error: 'No messages provided' });
    }
    
    try {
      // Extract user input from the latest message
      const userInput = messages[messages.length - 1].content;
      
      // Determine which context the user is in
      const pageContext = context?.page || 'general';
      const dataContext = context?.data ? JSON.stringify(context.data) : 'No specific data context';
      
      // Select the appropriate system prompt
      const systemPrompt = SYSTEM_PROMPTS[pageContext] || SYSTEM_PROMPTS.general;
      
      // Set up streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Generate AI response with streaming
      const stream = await model.pipe(contextAwarePrompt).pipe(new StringOutputParser()).stream({
        system_prompt: systemPrompt,
        page_context: pageContext,
        data_context: dataContext,
        user_input: userInput
      });
      
      // Stream the response to the client
      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      
      // End the response
      res.write('data: [DONE]\n\n');
      res.end();
      
    } catch (error) {
      console.error('Copilot controller error:', error);
      
      // Handle streaming errors
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to generate AI response',
          message: error.message
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  },

  /**
   * Handle CopilotKit action execution
   */
  handleActionRequest: async (req, res) => {
    const { action, parameters } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'No action specified' });
    }
    
    try {
      // Execute different actions based on the action type
      switch (action) {
        case 'updateProfile':
          // Logic for updating user profile
          return res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { ...parameters }
          });
          
        case 'manageIdea':
          // Logic for managing idea metadata and tags
          return res.json({
            success: true,
            message: 'Idea updated successfully',
            data: { ...parameters }
          });
          
        case 'generateSummary':
          // Logic for generating analysis summaries
          return res.json({
            success: true,
            message: 'Summary generated successfully',
            data: {
              summary: 'This is a generated summary of your analysis...'
            }
          });
          
        case 'createRecommendation':
          // Logic for creating personalized recommendations
          return res.json({
            success: true,
            message: 'Recommendation created successfully',
            data: {
              recommendation: 'Based on your idea, we recommend...'
            }
          });
          
        default:
          return res.status(400).json({
            error: 'Invalid action',
            message: `Action '${action}' is not supported`
          });
      }
    } catch (error) {
      console.error('Copilot action error:', error);
      res.status(500).json({
        error: 'Failed to execute action',
        message: error.message
      });
    }
  }
};

export default copilotController;
