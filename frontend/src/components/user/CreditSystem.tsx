/**
 * Credit System Component
 * Displays user's available credits and allows credit purchases
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, AlertCircle, TrendingUp, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserCredits, addCredits, CREDIT_PACKAGES } from '../../services/CreditService';

// Credit packages are now imported from CreditService
/* Replaced with imports from CreditService:
const DEMO_CREDIT_PACKAGES = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for testing a few startup ideas',
    credits: 5,
    price: 9.99,
    currency: 'USD',
    features: ['5 additional startup analyses', 'Full AI insights', 'PDF reports'],
    popular: false,
    isActive: true
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious entrepreneurs',
    credits: 15,
    price: 24.99,
    currency: 'USD',
    features: [
      '15 additional startup analyses',
      'Full AI insights',
      'PDF reports',
      'Competitor analysis',
      'Market trends'
    ],
    popular: true,
    isActive: true
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Maximize your validation efforts',
    credits: 50,
    price: 79.99,
    currency: 'USD',
    features: [
      '50 additional startup analyses',
      'Full AI insights',
      'PDF reports',
      'Competitor analysis',
      'Market trends',
      'Strategic recommendations',
      'Priority support'
    ],
    popular: false,
    isActive: true
  }
];
*/

// User credits are now fetched from CreditService

interface CreditSystemProps {
  onPurchaseComplete?: () => void;
}

const CreditSystem: React.FC<CreditSystemProps> = ({ onPurchaseComplete }) => {
  const { user } = useAuth();
  const [creditData, setCreditData] = useState({
    availableCredits: 0,
    totalCredits: 0,
    usedCredits: 0,
    loading: true
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Fetch user credits using CreditService
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.id) return;
      
      setCreditData(prev => ({ ...prev, loading: true }));
      
      try {
        // Get user credits or initialize if not found
        let credits = getUserCredits(user.id);
        
        if (!credits) {
          // In a production app, we'd initialize on the server
          console.log('No credits found for user, would initialize on server');
          setCreditData({
            availableCredits: 5, // Default free credits
            totalCredits: 5,
            usedCredits: 0,
            loading: false
          });
          return;
        }
        
        setCreditData({
          availableCredits: credits.availableCredits,
          totalCredits: credits.totalCreditsReceived,
          usedCredits: credits.totalCreditsUsed,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch credits:', error);
        setCreditData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchCredits();
  }, [user]);

  const handlePurchase = async () => {
    // Process the credit purchase
    if (!selectedPackage || !user?.id) return;
    
    const pkg = CREDIT_PACKAGES.find(p => p.id === selectedPackage);
    if (!pkg) return;
    
    // In a real app, this would include payment processing
    // For now, we'll just add the credits
    try {
      const updatedCredits = addCredits(user.id, pkg.credits);
      
      if (updatedCredits) {
        setCreditData({
          availableCredits: updatedCredits.availableCredits,
          totalCredits: updatedCredits.totalCreditsReceived,
          usedCredits: updatedCredits.totalCreditsUsed,
          loading: false
        });
      }
      
      setShowPurchaseModal(false);
      
      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
    } catch (error) {
      console.error('Failed to process purchase:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Your Search Credits</h3>
        
        {creditData.loading ? (
          <div className="animate-pulse h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ) : creditData.availableCredits <= 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center text-amber-600 dark:text-amber-400 text-sm font-medium"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            {creditData.availableCredits === 0 ? 'No credits left!' : 'Running low!'}
          </motion.div>
        )}
      </div>
      
      <div className="flex items-center gap-3 mb-8">
        <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Coins className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div>
          {creditData.loading ? (
            <div className="space-y-2">
              <div className="animate-pulse h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="animate-pulse h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold">{creditData.availableCredits} <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/ {creditData.totalCredits}</span></div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Available credits</div>
            </>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">About Credits</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Each startup idea validation requires 1 credit. New users get 5 free credits.
        </p>
      </div>
      
      <button
        onClick={() => setShowPurchaseModal(true)}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <ShoppingCart className="h-4 w-4" />
        Purchase More Credits
      </button>

      {/* Credit Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">Purchase Credits</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {CREDIT_PACKAGES.map(pkg => (
                <div 
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`border ${selectedPackage === pkg.id 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 dark:border-gray-700'} 
                    rounded-xl p-5 cursor-pointer relative ${
                      pkg.popular ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  
                  <h3 className="text-lg font-semibold mb-1">{pkg.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{pkg.description}</p>
                  
                  <div className="text-2xl font-bold mb-3">
                    ${pkg.price} <span className="text-sm font-normal text-gray-500">USD</span>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-xl font-semibold text-blue-600">{pkg.credits}</span> 
                    <span className="text-gray-600 dark:text-gray-300"> credits</span>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              
              <button
                onClick={handlePurchase}
                disabled={!selectedPackage}
                className={`px-5 py-2 bg-blue-600 text-white rounded-lg ${
                  !selectedPackage 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-700'
                }`}
              >
                Purchase Selected Package
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CreditSystem;
