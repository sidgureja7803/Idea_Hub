import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ideaService } from '../services/appwrite';
import { Lightbulb, CheckCircle, Clock, TrendingUp, Plus, Bell, User } from 'lucide-react';
import SimpleHeader from '../components/layout/SimpleHeader';
import Footer from '../components/layout/Footer';

interface Idea {
  $id: string;
  userId: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  status: 'pending' | 'researching' | 'completed';
  analysisResults: any;
}

const MyIdeasPage: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'your-ideas' | 'saved-ideas'>('your-ideas');
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
      } catch (err: any) {
        console.error('Failed to fetch ideas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, [user, isAuthenticated, navigate]);

  // Calculate stats
  const stats = {
    total: ideas.length,
    researched: ideas.filter(i => i.status === 'completed').length,
    pending: ideas.filter(i => i.status === 'pending' || i.status === 'researching').length,
    efficiency: ideas.length > 0 ? Math.round((ideas.filter(i => i.status === 'completed').length / ideas.length) * 100) : 0
  };
  
  // Generate gradient colors for idea cards
  const gradients = [
    'from-cyan-500/20 to-blue-500/20',
    'from-purple-500/20 to-pink-500/20',
    'from-emerald-500/20 to-teal-500/20',
    'from-orange-500/20 to-red-500/20',
    'from-indigo-500/20 to-blue-500/20'
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <SimpleHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Idea Gallery</h1>
            <p className="text-dark-400">Track your idea research progress and insights</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
              <Bell size={20} className="text-dark-400" />
            </button>
            <div className="flex items-center gap-2 bg-dark-800 rounded-lg px-4 py-2">
              <User size={20} className="text-primary-400" />
              <span className="text-sm">{user?.$id.substring(0, 8)}...</span>
              <span className="text-xs bg-accent-orange px-2 py-0.5 rounded text-white">4 credits</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={20} className="text-amber-400" />
              <span className="text-sm text-dark-400">Total Ideas</span>
            </div>
            <p className="text-4xl font-bold">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} className="text-accent-emerald" />
              <span className="text-sm text-dark-400">Researched</span>
            </div>
            <p className="text-4xl font-bold">{stats.researched}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} className="text-accent-cyan" />
              <span className="text-sm text-dark-400">Pending</span>
            </div>
            <p className="text-4xl font-bold">{stats.pending}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-accent-purple" />
              <span className="text-sm text-dark-400">Efficiency</span>
            </div>
            <p className="text-4xl font-bold">{stats.efficiency}%</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-8 border-b border-dark-700">
            <button
              onClick={() => setActiveTab('your-ideas')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'your-ideas' 
                  ? 'text-white' 
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              Your Ideas
              {activeTab === 'your-ideas' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('saved-ideas')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'saved-ideas' 
                  ? 'text-white' 
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              Saved Ideas
              {activeTab === 'saved-ideas' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
                />
              )}
            </button>
          </div>
        </div>

        {/* Ideas Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Idea Card */}
            <motion.button
              onClick={() => navigate('/validate-idea')}
              className="min-h-[280px] border-2 border-dashed border-dark-700 hover:border-dark-600 rounded-xl flex flex-col items-center justify-center gap-4 group transition-all hover:bg-dark-900/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center group-hover:bg-dark-700 transition-colors">
                <Plus size={32} className="text-dark-400" />
              </div>
              <span className="text-lg font-medium text-dark-400 group-hover:text-dark-300">Add New Idea</span>
            </motion.button>

            {/* Idea Cards */}
            {ideas.map((idea, index) => (
              <motion.div
                key={idea.$id}
                onClick={() => navigate(`/idea/${idea.$id}`)}
                className={`min-h-[280px] bg-gradient-to-br ${gradients[index % gradients.length]} backdrop-blur-sm border border-white/10 rounded-xl p-6 cursor-pointer group hover:scale-105 transition-all relative overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                {/* Status Badge */}
                {idea.status === 'researching' && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1.5 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-3 py-1">
                      <Clock size={12} className="text-amber-400 animate-pulse" />
                      <span className="text-xs text-amber-300 font-medium">Researching</span>
                    </div>
                  </div>
                )}
                
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-3 line-clamp-2">{idea.title}</h3>
                    <p className="text-sm text-dark-300 line-clamp-4">{idea.description}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="text-xs text-dark-500">
                      {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyIdeasPage;
