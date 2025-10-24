import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ideaService } from '../services/appwrite';
import { AlertCircle, Lightbulb, Send } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const IdeaSubmissionPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      navigate('/sign-in');
      return;
    }
    
    if (!title.trim() || !description.trim()) {
      setError('Please provide both title and description');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Check free tier limit
      const tierInfo = await ideaService.checkFreeTierLimit(user.$id);
      if (tierInfo.reachedLimit) {
        setError('Free tier limit reached (maximum 5 ideas). Please delete an existing idea or upgrade your plan.');
        setIsSubmitting(false);
        return;
      }
      
      // Submit idea for validation
      const ideaData = {
        userId: user.$id,
        title: title.trim(),
        description: description.trim(),
        isPublic
      };
      
      const response = await ideaService.createIdea(user.$id, ideaData, isPublic);
      
      // Redirect to results page
      navigate(`/idea/${response.$id}`);
      
    } catch (err: any) {
      console.error('Error submitting idea:', err);
      setError(err?.message || 'Failed to submit your idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Sample ideas for inspiration
  const sampleIdeas = [
    "A subscription service for curated plant care boxes based on your specific houseplants.",
    "An app that uses AI to identify clothing items from photos and finds similar affordable alternatives.",
    "A smart water bottle that syncs with fitness apps and reminds you to hydrate based on your activity level.",
    "A marketplace connecting home chefs with local customers for authentic homemade meals."
  ];
  
  const handleUseSampleIdea = (idea: string) => {
    setDescription(idea);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Validate Your Idea</h1>
              <p className="text-gray-400 max-w-xl mx-auto">
                Describe your business idea below and our AI will analyze its market potential, 
                competitive landscape, and provide strategic recommendations.
              </p>
            </div>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200"
              >
                <AlertCircle size={20} />
                <span>{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-gray-900/70 border border-gray-800 rounded-xl p-6 shadow-lg">
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Idea Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full p-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="E.g., AI-Powered Meal Planning App"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Idea Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full p-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500 min-h-[200px]"
                  placeholder="Describe your business idea in detail. What problem does it solve? Who is your target audience? How will it work?"
                  required
                />
                
                <div className="mt-2">
                  <p className="text-sm text-gray-400 mb-2">Need inspiration? Try one of these:</p>
                  <div className="flex flex-wrap gap-2">
                    {sampleIdeas.map((idea, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleUseSampleIdea(idea)}
                        className="text-xs text-primary-400 bg-primary-900/30 border border-primary-800/50 rounded-full px-3 py-1.5 hover:bg-primary-900/50 transition-colors"
                      >
                        <span className="line-clamp-1">{idea.substring(0, 30)}...</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center">
                  <input
                    id="isPublic"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-300">
                    Share this idea publicly in the gallery
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Public ideas can be viewed by anyone using the platform. Private ideas are only visible to you.
                </p>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-3 rounded-lg flex items-center gap-2 text-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb size={20} />
                      <span>Validate My Idea</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                By submitting, you agree to our <a href="/terms" className="text-primary-400 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</a>.
              </div>
            </form>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default IdeaSubmissionPage;