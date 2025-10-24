import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Lightbulb, 
  AlertCircle, 
  CheckCircle,
  Loader
} from 'lucide-react';
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
  const [formData, setFormData] = useState<IdeaSubmission>({
    description: '',
    category: '',
    targetAudience: '',
    problemSolved: ''
  });

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
      const response = await api.post('/ideas/analyze-idea', formData);
      const { jobId } = response;
      navigate(`/results/${jobId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while analyzing your idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseSampleIdea = async () => {
    const sampleIdea: IdeaSubmission = {
      description: "A mobile app that connects local farmers directly with consumers, allowing people to purchase fresh, seasonal produce directly from farms within a 50-mile radius. The app shows what's currently in season, handles payments, and coordinates weekly pickup/delivery options.",
      category: "Marketplace",
      targetAudience: "Health-conscious consumers, supporters of local agriculture, busy professionals who value quality produce",
      problemSolved: "Eliminates middlemen in the food supply chain, reduces food miles, provides fresher produce to consumers, and helps small local farms increase their profit margins and customer base."
    };
    setFormData(sampleIdea);
  };

  const inspirationIdeas = [
    "A mobile app that connects local farmers with urban consumers for fresh, farm-to-table produce deliveries.",
    "A personalized coaching service helping remote workers improve productivity and work-life balance through tailored strategies.",
    "An eco-friendly gadget designed for sustainable travel, combining convenience with environmentally conscious materials.",
    "An online platform that enables niche hobbyists to buy, sell, and share custom-made accessories and collectibles."
  ];

  const isFormValid = formData.description.trim() && formData.category && formData.problemSolved.trim();
  const wordCount = formData.description.trim().split(/\s+/).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            What's your next big idea?
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Describe your business concept and let our AI help you develop it.
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 mb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Idea Description */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label 
                  htmlFor="description" 
                  className="block text-sm font-medium text-white"
                >
                  Describe Your Idea
                </label>
                <span className="text-sm text-gray-400">
                  {wordCount} words
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-4 py-4 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-gray-800 text-white placeholder-gray-400 transition-colors duration-200 resize-none"
                placeholder="Start with a short description of your idea..."
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`flex items-center justify-center px-8 py-3 rounded-lg font-medium transition-colors ${
                  isFormValid && !isSubmitting
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-3" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-3" />
                    Continue
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="px-8 py-3 bg-transparent border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <p className="text-red-400">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Inspiration Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Lightbulb className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-400">Need inspiration? Try one of these:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspirationIdeas.map((idea, index) => (
              <div 
                key={index}
                onClick={() => setFormData(prev => ({ ...prev, description: idea }))}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300 text-sm leading-relaxed">{idea}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Form Fields (Hidden by default, shown when needed) */}
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 space-y-6">
          <h3 className="text-lg font-semibold text-white mb-4">Additional Details (Optional)</h3>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-gray-800 text-white"
            >
              <option value="">Select a category</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Finance">Finance</option>
              <option value="Technology">Technology</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Marketplace">Marketplace</option>
              <option value="SaaS">SaaS</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-white mb-2">
              Target Audience
            </label>
            <input
              type="text"
              id="targetAudience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
              placeholder="e.g., Small business owners, College students"
            />
          </div>

          {/* Problem Solved */}
          <div>
            <label htmlFor="problemSolved" className="block text-sm font-medium text-white mb-2">
              Main Problem Solved
            </label>
            <textarea
              id="problemSolved"
              name="problemSolved"
              value={formData.problemSolved}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-gray-800 text-white placeholder-gray-400 resize-none"
              placeholder="What specific problem does your startup solve?"
            />
          </div>
        </div>

        {/* Progress Indicator */}
        {isSubmitting && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center space-x-2 text-gray-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Our AI agents are analyzing your idea...</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This usually takes 30-60 seconds
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaSubmissionPage;