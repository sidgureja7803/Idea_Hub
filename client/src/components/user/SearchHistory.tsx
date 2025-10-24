/**
 * SearchHistory Component
 * Displays user's search history and current usage statistics
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../utils/api';

interface SearchHistoryItem {
  ideaId: string;
  jobId: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: any;
  createdAt: string;
  completedAt?: string;
}

interface SearchHistoryProps {
  limit?: number;
  showStats?: boolean;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ 
  limit = 10, 
  showStats = true 
}) => {
  const { user, userStats, isAuthenticated } = useAuth();
  const api = useApi();
  const [searches, setSearches] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSearchHistory();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchSearchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user/history?limit=${limit}`);
      if (response.success) {
        setSearches(response.searches);
      } else {
        setError('Failed to fetch search history');
      }
    } catch (error) {
      console.error('Error fetching search history:', error);
      setError('Failed to load search history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Search History
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Please sign in to view your search history.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Search History
        </h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Search History
        </h3>
        <div className="text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header with stats */}
      {showStats && userStats && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Search History
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {userStats.tier.charAt(0).toUpperCase() + userStats.tier.slice(1)} Tier
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userStats.searchesUsed}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Searches Used
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userStats.maxSearches === -1 ? '∞' : userStats.maxSearches}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Max Searches
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userStats.remainingSearches === -1 ? '∞' : userStats.remainingSearches}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Remaining
              </div>
            </div>
          </div>
          
          {!userStats.canSearch && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                You've reached your search limit for this period. 
                {userStats.tier === 'free' && (
                  <span className="ml-1">
                    <a href="/upgrade" className="font-medium underline">
                      Upgrade to Premium
                    </a> for more searches.
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search history list */}
      <div className="p-6">
        {searches.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No searches yet
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              Submit your first business idea to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {searches.map((search) => (
              <div
                key={search.ideaId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {search.title}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(search.status)}`}
                  >
                    {search.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {truncateText(search.description, 150)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {search.category}
                  </span>
                  <span>
                    {formatDate(search.createdAt)}
                  </span>
                </div>
                
                {search.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        // Navigate to results page
                        window.location.href = `/results/${search.ideaId}`;
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View Results →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistory;