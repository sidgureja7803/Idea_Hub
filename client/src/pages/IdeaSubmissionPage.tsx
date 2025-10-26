import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ideaService } from '../services/appwrite';
import { AlertCircle, Lightbulb, Send, Sparkles } from 'lucide-react';
import SimpleHeader from '../components/layout/SimpleHeader';
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
    {
      title: "Farm-to-Table Delivery",
      description: "A mobile app that connects local farmers with urban consumers for fresh, farm-to-table produce deliveries."
    },
    {
      title: "Remote Work Coaching",
      description: "A personalized coaching service helping remote workers improve productivity and work-life balance through tailored strategies."
    },
    {
      title: "Eco-Friendly Travel Gadgets",
      description: "An eco-friendly gadget designed for sustainable travel, combining convenience with environmentally conscious materials."
    },
    {
      title: "Niche Hobby Platform",
      description: "An online platform that enables niche hobbyists to buy, sell, and share custom-made accessories and collectibles."
    }
  ];
  
  const handleUseSampleIdea = (idea: typeof sampleIdeas[0]) => {
    setTitle(idea.title);
    setDescription(idea.description);
  };
  
  const wordCount = description.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <SimpleHeader />
      
      <main className="flex-grow container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">What's your next big idea?</h1>
            <p className="text-xl text-dark-400 max-w-2xl mx-auto">
              Describe your business concept and let our AI help you develop it
            </p>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-200"
            >
              <AlertCircle size={20} />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-dark-400 hover:text-white"
              >
                ✕
              </button>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="relative">
            {/* Word count display */}
            <div className="absolute top-4 right-4 z-10">
              <span className="text-sm text-dark-400">{wordCount} words</span>
            </div>
            
            {/* Main textarea */}
            <div className="mb-8">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full p-6 pt-12 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[320px] text-lg"
                placeholder="Start with a short description of your idea..."
                required
              />
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className="bg-dark-800 hover:bg-dark-700 disabled:bg-dark-850 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  {isSubmitting ? 'Processing...' : 'Continue'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDescription('');
                    setTitle('');
                  }}
                  className="bg-transparent hover:bg-dark-800 text-white border border-dark-700 px-6 py-3 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
              
              <button
                type="button"
                className="text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2"
              >
                <Send size={18} />
              </button>
            </div>
            
            {/* Sample ideas section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-dark-400" />
                <p className="text-sm text-dark-400">Need inspiration? Try one of these:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleIdeas.map((idea, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => handleUseSampleIdea(idea)}
                    className="text-left p-4 bg-dark-900/30 border border-dark-800 rounded-xl hover:bg-dark-900/50 hover:border-dark-700 transition-all duration-200 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb size={18} className="text-dark-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-white mb-1 group-hover:text-primary-400 transition-colors">
                          {idea.title}
                        </h3>
                        <p className="text-xs text-dark-400 line-clamp-2">
                          {idea.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default IdeaSubmissionPage;