import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ideaService } from '../services/appwrite';
import { Search, Eye, Users, Calendar, ArrowRight, AlertCircle } from 'lucide-react';
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
  userName?: string;
}

const GalleryPage: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch public ideas
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setIsLoading(true);
        const response = await ideaService.getPublicIdeas();
        setIdeas(response.documents as Idea[]);
      } catch (err: any) {
        console.error('Failed to fetch public ideas:', err);
        setError('Failed to load public ideas. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  // Filter ideas based on search query
  const filteredIdeas = ideas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort ideas by date (newest first)
  const sortedIdeas = [...filteredIdeas].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
            <div>
              <h1 className="text-3xl font-bold mb-2">Public Gallery</h1>
              <p className="text-gray-400">
                Browse validated business ideas shared by the community
              </p>
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

          {/* Search */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search ideas in the gallery..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-800/50 rounded-lg text-white placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Public ideas grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : sortedIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedIdeas.map((idea) => (
                <motion.div
                  key={idea.$id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-900/70 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all h-full flex flex-col"
                >
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold line-clamp-2">{idea.title}</h3>
                      <div className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 flex-shrink-0">
                        <Eye size={14} />
                        <span>Public</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4 line-clamp-3">
                      {idea.description}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-800 p-4 bg-gray-900/30">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {idea.userName || "Anonymous User"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {new Date(idea.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <button
                        onClick={() => navigate(`/idea/${idea.$id}`)}
                        className="w-full flex justify-center items-center gap-1 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        <span>View Analysis</span>
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
                {searchQuery 
                  ? 'No public ideas match your search.' 
                  : 'No public ideas available yet. Be the first to share yours!'}
              </div>
              <button
                onClick={() => navigate('/validate-idea')}
                className="btn-primary px-5 py-2.5 rounded-lg mx-auto"
              >
                Validate & Share Your Idea
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default GalleryPage;
