import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Loader, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useApi } from '../../utils/api';

interface FollowUpQuestionsProps {
  initialIdea: string;
  onComplete: (updatedIdea: string, answers: Record<string, string>) => void;
  onCancel: () => void;
}

const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({ 
  initialIdea, 
  onComplete, 
  onCancel 
}) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enhancedIdea, setEnhancedIdea] = useState(initialIdea);
  const [aiThinking, setAiThinking] = useState(false);
  const api = useApi();

  // Generate questions based on the initial idea
  useEffect(() => {
    const generateQuestions = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Call the backend to generate follow-up questions using Cerebras/Llama
        const response = await api.post('/ideas/generate-questions', { 
          ideaDescription: initialIdea 
        });
        
        if (response && response.questions && Array.isArray(response.questions)) {
          setQuestions(response.questions.slice(0, 3)); // Limit to 3 questions
        } else {
          // Fallback questions in case the API fails
          setQuestions([
            "What specific problem does your idea solve for your target audience?",
            "Who are your main competitors and how is your solution different?",
            "What is your plan for acquiring early customers or users?"
          ]);
        }
      } catch (err) {
        console.error("Error generating questions:", err);
        setError("Failed to generate questions. Using default questions instead.");
        
        // Set fallback questions
        setQuestions([
          "What specific problem does your idea solve for your target audience?",
          "Who are your main competitors and how is your solution different?",
          "What is your plan for acquiring early customers or users?"
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateQuestions();
  }, [initialIdea, api]);

  // Handle answer input
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setAnswers({
      ...answers,
      [currentQuestionIndex]: value
    });
  };

  // Handle next question
  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // This is the last question, process all answers
      await handleSubmitAnswers();
    }
  };

  // Handle submit all answers
  const handleSubmitAnswers = async () => {
    setIsSubmitting(true);
    setAiThinking(true);
    setError(null);
    
    try {
      // Format answers into an array
      const answersArray = questions.map((_, index) => answers[index] || "");
      
      // Call the backend to enhance the idea with the answers
      const response = await api.post('/ideas/enhance-idea', {
        initialIdea,
        questions,
        answers: answersArray
      });
      
      if (response && response.enhancedIdea) {
        setEnhancedIdea(response.enhancedIdea);
        
        // Wait a moment to show the "AI thinking" state
        setTimeout(() => {
          setAiThinking(false);
          
          // Wait a moment more before calling onComplete
          setTimeout(() => {
            // Convert answers from index-based to question-based
            const questionAnswerMap: Record<string, string> = {};
            questions.forEach((question, index) => {
              questionAnswerMap[question] = answers[index] || "";
            });
            
            onComplete(response.enhancedIdea, questionAnswerMap);
          }, 1000);
        }, 2000);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error enhancing idea:", err);
      setError("Failed to process your answers. Please try again.");
      setAiThinking(false);
      setIsSubmitting(false);
    }
  };

  // Check if the current answer is valid
  const isCurrentAnswerValid = () => {
    return answers[currentQuestionIndex]?.trim().length > 0;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 } 
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Analyzing your idea...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Our AI is preparing follow-up questions to enhance your idea.
            </p>
          </motion.div>
        ) : aiThinking ? (
          <motion.div 
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="relative">
              <Loader className="w-16 h-16 text-purple-500 animate-spin mb-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
              Enhancing your idea...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md text-center">
              Our Cerebras-powered Llama models are processing your responses to create a comprehensive analysis.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="questions"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                  <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Follow-up Questions
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300">
                Please answer these questions to help us provide a more detailed analysis of your idea.
              </p>
            </motion.div>
            
            {error && (
              <motion.div
                variants={itemVariants}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}
            
            {/* Question Progress Indicator */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </motion.div>
            
            {/* Current Question */}
            <motion.div 
              variants={itemVariants}
              className="mb-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {questions[currentQuestionIndex]}
              </h3>
              
              <textarea
                value={answers[currentQuestionIndex] || ''}
                onChange={handleAnswerChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                placeholder="Your answer..."
              />
            </motion.div>
            
            {/* Navigation Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-between gap-4"
            >
              <button
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              
              <button
                onClick={handleNextQuestion}
                disabled={!isCurrentAnswerValid() || isSubmitting}
                className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isCurrentAnswerValid() && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-3" />
                    Processing...
                  </>
                ) : currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  <>
                    Complete
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FollowUpQuestions;

// Helper component for the thinking state
const Lightbulb = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 2C7.589 2 4 5.589 4 10c0 2.29.95 4.36 2.48 5.83.37.36.76.69 1.17.97.59.4.98 1.01 1.13 1.7l.22 1.5H15l.22-1.5c.15-.69.54-1.3 1.13-1.7.41-.28.8-.61 1.17-.97C19.05 14.36 20 12.29 20 10c0-4.411-3.589-8-8-8zm0 14h-4v-1h4v1zm2.31-3.1l-.24.24c-.42.43-.66 1.04-.7 1.66h-2.74c-.04-.62-.28-1.23-.7-1.66l-.24-.24C7.58 11.76 7 10.91 7 10c0-2.757 2.243-5 5-5s5 2.243 5 5c0 .91-.58 1.76-1.69 2.9z"/>
  </svg>
);
