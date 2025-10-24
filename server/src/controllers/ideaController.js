/**
 * Idea Controller
 * Handles idea submission, follow-up questions, and idea enhancement
 */

import { v4 as uuidv4 } from 'uuid';
import Idea from '../models/Idea.js';
import { enqueueIdeaAnalysis } from '../queue/queueConfig.js';
import getCerebrasService from '../services/cerebrasService.js';
import { TASK_COMPLEXITY } from '../constants/cerebras.js';

// Get Cerebras service instance
const cerebrasService = getCerebrasService();

/**
 * Submit a new idea for analysis
 */
export const submitIdea = async (req, res) => {
  try {
    const { description, category, targetAudience, problemSolved, title } = req.body;

    // Validate required fields
    if (!description || !category || !problemSolved) {
      return res.status(400).json({
        message: 'Missing required fields: description, category, and problemSolved are required'
      });
    }

    // Create new idea record
    const ideaId = uuidv4();
    const idea = new Idea({
      id: ideaId,
      description,
      category,
      targetAudience,
      problemSolved,
      status: 'pending'
    });

    await idea.save();

    // Add idea to job queue
    const ideaData = {
      ideaId,
      description,
      category,
      targetAudience,
      problemSolved
    };
    
    const job = await enqueueIdeaAnalysis(ideaData);

    // Prepare data for tracking
    req.trackedSearch = {
      ideaId,
      jobId: job.id,
      title: title || `${category} Business Idea`,
      description,
      category
    };

    res.status(201).json({
      message: 'Idea submitted successfully',
      jobId: job.id,
      analysisId: ideaId,
      userStats: req.userStats
    });
  } catch (error) {
    console.error('Error submitting idea:', error);
    res.status(500).json({
      message: 'Failed to submit idea',
      error: error.message
    });
  }
};

/**
 * Generate follow-up questions based on the initial idea
 */
export const generateQuestions = async (req, res) => {
  try {
    const { ideaDescription } = req.body;

    if (!ideaDescription) {
      return res.status(400).json({
        message: 'Missing required field: ideaDescription'
      });
    }

    // System prompt for generating follow-up questions
    const systemPrompt = `You are an expert startup analyst using Llama models on Cerebras infrastructure.
    Based on the startup idea description provided, generate exactly 3 follow-up questions that would 
    help you better understand and evaluate the business idea. 
    
    Your questions should:
    1. Be specific and targeted to gather critical information missing from the initial description
    2. Focus on market fit, competitive advantage, and execution strategy
    3. Help the founder think more deeply about their idea
    
    Format your response as a JSON array of exactly 3 questions, like this:
    ["Question 1", "Question 2", "Question 3"]
    
    Do not include any other text in your response.`;

    // Call Cerebras service to generate questions
    const result = await cerebrasService.generateStructuredOutput(
      systemPrompt,
      ideaDescription,
      { temperature: 0.7, max_completion_tokens: 1024 },
      TASK_COMPLEXITY.MEDIUM
    );

    // Parse the response as JSON
    let questions;
    try {
      questions = JSON.parse(result);
      
      // Ensure we have exactly 3 questions
      if (!Array.isArray(questions) || questions.length !== 3) {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Error parsing questions:', parseError);
      
      // Fallback questions if parsing fails
      questions = [
        "What specific problem does your idea solve for your target audience?",
        "Who are your main competitors and how is your solution different?",
        "What is your plan for acquiring early customers or users?"
      ];
    }

    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      message: 'Failed to generate questions',
      error: error.message
    });
  }
};

/**
 * Enhance the idea based on follow-up question answers
 */
export const enhanceIdea = async (req, res) => {
  try {
    const { initialIdea, questions, answers } = req.body;

    if (!initialIdea || !questions || !answers) {
      return res.status(400).json({
        message: 'Missing required fields: initialIdea, questions, and answers are required'
      });
    }

    // Format the questions and answers for the prompt
    const questionsAndAnswers = questions.map((q, i) => 
      `Question: ${q}\nAnswer: ${answers[i] || 'No answer provided'}`
    ).join('\n\n');

    // System prompt for enhancing the idea
    const systemPrompt = `You are an expert startup analyst using Llama models on Cerebras infrastructure.
    You will be given an initial startup idea description, followed by a set of follow-up questions and answers.
    
    Your task is to enhance and refine the original idea based on the additional information provided in the answers.
    Create a comprehensive, well-structured description that incorporates all the key details from both the 
    original idea and the follow-up answers.
    
    The enhanced description should:
    1. Be clear, concise, and professionally written
    2. Include all relevant information from both the original idea and the follow-up answers
    3. Be structured in a logical way that would help with further analysis
    4. Be between 200-400 words in length
    
    Respond with ONLY the enhanced description, without any additional commentary.`;

    // Combine the initial idea with questions and answers
    const userInput = `Initial Idea:\n${initialIdea}\n\nFollow-up Information:\n${questionsAndAnswers}`;

    // Call Cerebras service to enhance the idea
    const enhancedIdea = await cerebrasService.generateStructuredOutput(
      systemPrompt,
      userInput,
      { temperature: 0.7, max_completion_tokens: 2048 },
      TASK_COMPLEXITY.HEAVY
    );

    res.json({ enhancedIdea });
  } catch (error) {
    console.error('Error enhancing idea:', error);
    res.status(500).json({
      message: 'Failed to enhance idea',
      error: error.message
    });
  }
};
