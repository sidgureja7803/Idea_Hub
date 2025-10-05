import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Send, 
  Lightbulb, 
  Tag, 
  AlertCircle, 
  CheckCircle,
  Loader,
  Sparkles
} from 'lucide-react';
import FollowUpQuestions from '../components/idea/FollowUpQuestions';
import { useApi } from '../utils/api';

interface IdeaSubmission {
  description: string;
  category: string;
  targetAudience: string;
  problemSolved: string;
}

const IdeaSubmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const api = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [formData, setFormData] = useState<IdeaSubmission>({
    description: '',
    category: '',
    targetAudience: '',
    problemSolved: ''
  });
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
  
  // Sample idea for quick testing
  const sampleIdea: IdeaSubmission = {
    description: "A mobile app that connects local farmers directly with consumers, allowing people to purchase fresh, seasonal produce directly from farms within a 50-mile radius. The app shows what's currently in season, handles payments, and coordinates weekly pickup/delivery options.",
    category: "Marketplace",
    targetAudience: "Health-conscious consumers, supporters of local agriculture, busy professionals who value quality produce",
    problemSolved: "Eliminates middlemen in the food supply chain, reduces food miles, provides fresher produce to consumers, and helps small local farms increase their profit margins and customer base."
  };

  const categories = [
    'Healthcare', 'Education', 'Finance', 'Technology', 'E-commerce',
    'SaaS', 'Marketplace', 'Social Media', 'Gaming', 'Sustainability',
    'Food & Beverage', 'Travel', 'Real Estate', 'Fashion', 'Other'
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Instead of submitting directly, show follow-up questions
      setShowFollowUp(true);
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle completion of follow-up questions
  const handleFollowUpComplete = async (enhancedIdea: string, answers: Record<string, string>) => {
    setIsSubmitting(true);
    setError(null);
    setFollowUpAnswers(answers);
    
    try {
      // Submit the enhanced idea with follow-up answers
      const enhancedFormData = {
        ...formData,
        description: enhancedIdea,
        followUpAnswers: answers
      };
      
      const response = await api.post('/ideas/analyze-idea', enhancedFormData);
      const { jobId } = response;
      
      navigate(`/results/${jobId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while analyzing your idea. Please try again.');
      setShowFollowUp(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancellation of follow-up questions
  const handleFollowUpCancel = () => {
    setShowFollowUp(false);
  };
  
  const handleUseSampleIdea = async () => {
    setFormData(sampleIdea);
  };

  const isFormValid = formData.description.trim() && formData.category && formData.problemSolved.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Lightbulb className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Submit Your Startup Idea
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Describe your startup concept and let our AI agents provide comprehensive validation and insights
          </p>
        </motion.div>

        {showFollowUp ? (
          <FollowUpQuestions 
            initialIdea={formData.description}
            onComplete={handleFollowUpComplete}
            onCancel={handleFollowUpCancel}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
            {/* Idea Description */}
            <div>
              <label 
                htmlFor="description" 
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-3"
              >
                Describe Your Startup Idea *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                placeholder="Provide a detailed description of your startup idea, including what problem it solves, how it works, and what makes it unique..."
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Be as detailed as possible. This helps our AI provide more accurate analysis.
              </p>
            </div>

            {/* Category Selection */}
            <div>
              <label 
                htmlFor="category" 
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-3"
              >
                <Tag className="inline h-4 w-4 mr-2" />
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label 
                htmlFor="targetAudience" 
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-3"
              >
                Target Audience
              </label>
              <input
                type="text"
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                placeholder="e.g., Small business owners, College students, Healthcare professionals"
              />
            </div>

            {/* Problem Solved */}
            <div>
              <label 
                htmlFor="problemSolved" 
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-3"
              >
                Main Problem Solved *
              </label>
              <textarea
                id="problemSolved"
                name="problemSolved"
                value={formData.problemSolved}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                placeholder="What specific problem does your startup solve? How painful is this problem for your target audience?"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
              >
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Submit and Sample Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                whileHover={{ scale: isFormValid && !isSubmitting ? 1.02 : 1 }}
                whileTap={{ scale: isFormValid && !isSubmitting ? 0.98 : 1 }}
                className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg ${
                  isFormValid && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-3" />
                    Analyzing Your Idea...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-3" />
                    Start AI Analysis
                  </>
                )}
              </motion.button>
              
              <motion.button
                type="button"
                onClick={handleUseSampleIdea}
                disabled={isSubmitting}
                whileHover={{ scale: !isSubmitting ? 1.02 : 1 }}
                whileTap={{ scale: !isSubmitting ? 0.98 : 1 }}
                className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-900/20"
              >
                <Sparkles className="h-5 w-5 mr-3" />
                Try Sample Idea
              </motion.button>
            </div>

            {/* Progress Indicator */}
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Our AI agents are analyzing your idea...</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This usually takes 30-60 seconds
                </p>
              </motion.div>
            )}
          </form>
        </motion.div>
        )}

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-blue-600 dark:text-blue-400 mb-3">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Comprehensive Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get insights across market research, competition, feasibility, and strategy
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-green-600 dark:text-green-400 mb-3">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Real-time Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analysis powered by current market data and competitive intelligence
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-purple-600 dark:text-purple-400 mb-3">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Actionable Insights
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive specific recommendations and next steps for your startup journey
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IdeaSubmissionPage;
