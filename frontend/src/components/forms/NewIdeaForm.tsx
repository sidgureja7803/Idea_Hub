import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';

const NewIdeaForm: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { subscribeToTask } = useWebSocket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idea.trim()) {
      setError('Please enter your startup idea');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Submit idea to the backend
      const response = await axios.post('/api/run-idea', { idea });
      const { taskId } = response.data;
      
      // Subscribe to events for this task
      subscribeToTask(taskId);
      
      // Navigate to results page with task ID
      navigate(`/results/${taskId}`);
    } catch (err: any) {
      console.error('Error submitting idea:', err);
      setError(err.response?.data?.message || 'Failed to submit idea. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Submit a New Startup Idea
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="idea" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Describe your startup idea
          </label>
          <textarea
            id="idea"
            rows={4}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="E.g., A subscription service for eco-friendly office supplies targeting small businesses..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !idea.trim()}
            className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 
                     text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     transition-colors duration-200 ${loading || !idea.trim() ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default NewIdeaForm;
