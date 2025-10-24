/**
 * User Credits Component
 * Displays a user's credit balance and transaction history
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  AlertCircle, 
  Plus, 
  Minus, 
  Clock, 
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Types
interface Transaction {
  id: string;
  amount: number;
  type: 'purchase' | 'usage' | 'refund' | 'other';
  description: string;
  createdAt: string;
  metadata?: any;
}

interface UserCreditsProps {
  userId: string;
  onPurchaseClick?: () => void;
  apiBaseUrl?: string;
  className?: string;
}

const UserCredits: React.FC<UserCreditsProps> = ({
  userId,
  onPurchaseClick,
  apiBaseUrl = 'http://localhost:5000/api',
  className = ''
}) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  // Fetch user credit data
  const fetchUserCredits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${apiBaseUrl}/credits/user/${userId}`);
      setBalance(response.data.balance);
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Error fetching user credits:', err);
      setError('Failed to load credit information');
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    if (userId) {
      fetchUserCredits();
    }
  }, [userId]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchUserCredits();
  };
  
  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Loading credit information...</span>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Credit Balance</h2>
        <button
          onClick={handleRefresh}
          className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
          aria-label="Refresh credit information"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={16} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}
      
      {/* Credit Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <CreditCard size={18} />
            <span className="text-sm font-medium">Available Credits</span>
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-2xl font-bold">{balance !== null ? balance : '-'}</h3>
          <p className="text-xs text-blue-100 mt-1">
            Use credits for AI analysis and premium features
          </p>
        </div>
        {onPurchaseClick && (
          <button
            onClick={onPurchaseClick}
            className="mt-3 w-full bg-white text-blue-600 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Purchase More Credits
          </button>
        )}
      </div>
      
      {/* Recent Transactions */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Recent Transactions
        </h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            No transaction history available
          </div>
        ) : (
          <div className="space-y-2">
            {/* Transactions List */}
            {transactions
              .slice(0, showAllTransactions ? undefined : 5)
              .map((transaction, index) => (
                <div 
                  key={transaction.id || index}
                  className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${
                      transaction.type === 'purchase' 
                        ? 'bg-green-100 text-green-600' 
                        : transaction.type === 'usage'
                          ? 'bg-orange-100 text-orange-600'
                          : transaction.type === 'refund'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                    }`}>
                      {transaction.type === 'purchase' ? (
                        <Plus size={14} />
                      ) : transaction.type === 'usage' ? (
                        <Minus size={14} />
                      ) : (
                        <Clock size={14} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {transaction.description || 
                          (transaction.type === 'purchase' 
                            ? 'Credit Purchase' 
                            : transaction.type === 'usage'
                              ? 'Credit Usage'
                              : 'Transaction'
                          )
                        }
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    transaction.amount > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </span>
                </div>
              ))}
              
            {/* Show More / Less Button */}
            {transactions.length > 5 && (
              <button
                onClick={() => setShowAllTransactions(!showAllTransactions)}
                className="flex items-center justify-center w-full mt-2 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showAllTransactions ? (
                  <>Show Less <ChevronUp size={16} className="ml-1" /></>
                ) : (
                  <>Show More <ChevronDown size={16} className="ml-1" /></>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserCredits;
