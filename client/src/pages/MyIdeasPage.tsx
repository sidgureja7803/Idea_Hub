import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ideaService } from '../services/appwrite';
import { Search, Eye, EyeOff, Download, ArrowRight, Plus, AlertCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface Idea {
  $id: string;
  userId: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  analysisResults: any;
}

const MyIdeasPage: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [freeTierInfo, setFreeTierInfo] = useState({ total: 0, reachedLimit: false });
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Fetch user ideas
  useEffect(() => {
    const fetchIdeas = async () => {
      if (!isAuthenticated || !user) {
        navigate('/sign-in');
        return;
      }

      try {
        setIsLoading(true);
        const response = await ideaService.getUserIdeas(user.$id);
        setIdeas(response.documents as Idea[]);
        
        // Check free tier limit
        const tierInfo = await ideaService.checkFreeTierLimit(user.$id);
        setFreeTierInfo(tierInfo);
        
      } catch (err: any) {
        console.error('Failed to fetch ideas:', err);
        setError('Failed to load your ideas. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, [user, isAuthenticated, navigate]);

  // Toggle idea visibility
  const toggleVisibility = async (ideaId: string, currentVisibility: boolean) => {
    try {
      await ideaService.updateIdeaVisibility(ideaId, !currentVisibility);
      
      // Update local state
      setIdeas(ideas.map(idea => 
        idea.$id === ideaId 
          ? { ...idea, isPublic: !currentVisibility } 
          : idea
      ));
    } catch (err: any) {
      console.error('Failed to update visibility:', err);
      setError('Failed to update visibility. Please try again.');
    }
  };

  // Filter ideas based on search query
  const filteredIdeas = ideas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort ideas by date (newest first)
  const sortedIdeas = [...filteredIdeas].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Download idea analysis as JSON
  const downloadAnalysis = (idea: Idea) => {
    const analysisBlob = new Blob(
      [JSON.stringify(idea.analysisResults, null, 2)], 
      { type: 'application/json' }
    );
    
    const url = URL.createObjectURL(analysisBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title.replace(/\s+/g, '-').toLowerCase()}-analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Ideas</h1>
            
            <div className="flex gap-4 items-center">
              {!freeTierInfo.reachedLimit ? (
                <button
                  onClick={() => navigate('/validate-idea')}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-lg"
                >
                  <Plus size={18} />
                  <span>Validate New Idea</span>
                </button>
              ) : (
                <div className="text-amber-400 flex items-center gap-2">
                  <AlertCircle size={18} />
                  <span className="text-sm">Free tier limit reached (5/5)</span>
                </div>
              )}
            </div>
          </div>

          {/* Free tier info */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-medium mb-1">Free Tier Usage</h2>
                <p className="text-gray-400 text-sm">
                  You've used {freeTierInfo.total}/5 idea validations
                </p>
              </div>
              
              <div className="w-full md:w-64">
                <div className="h-2 bg-gray-700 rounded-full">
                  <div 
                    className="h-2 bg-primary-500 rounded-full"
                    style={{ width: `${(freeTierInfo.total / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
              <AlertCircle size={20} />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Search and filter */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search your ideas..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-800/50 rounded-lg text-white placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Ideas list */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : sortedIdeas.length > 0 ? (
            <div className="space-y-6">
              {sortedIdeas.map((idea) => (
                <motion.div
                  key={idea.$id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-900/70 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">{idea.title}</h3>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleVisibility(idea.$id, idea.isPublic)}
                          className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${
                            idea.isPublic 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-gray-700/50 text-gray-300'
                          }`}
                        >
                          {idea.isPublic ? (
                            <>
                              <Eye size={14} />
                              <span>Public</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={14} />
                              <span>Private</span>
                            </>
                          )}
                        </button>
                        
                        <span className="text-xs text-gray-400">
                          {new Date(idea.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4 line-clamp-2">
                      {idea.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => downloadAnalysis(idea)}
                          className="flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300"
                        >
                          <Download size={16} />
                          <span>Download Analysis</span>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => navigate(`/idea/${idea.$id}`)}
                        className="flex items-center gap-1 text-sm font-medium text-primary-400 hover:text-primary-300"
                      >
                        <span>View Details</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                {searchQuery ? 'No ideas match your search.' : 'You haven\'t validated any ideas yet.'}
              </div>
              {!searchQuery && (
                <button
                  onClick={() => navigate('/validate-idea')}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-lg mx-auto"
                >
                  <Plus size={18} />
                  <span>Validate Your First Idea</span>
                </button>
              )}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default MyIdeasPage;
