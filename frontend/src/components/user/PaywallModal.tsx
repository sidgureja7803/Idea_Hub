/**
 * PaywallModal Component
 * Shows when users attempt to perform a search without sufficient credits
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Check } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (packageId: string) => void;
}

// Sample credit packages - in a real app these would be fetched from an API
const CREDIT_PACKAGES = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for testing a few startup ideas',
    credits: 5,
    price: 9.99,
    currency: 'USD',
    features: ['5 additional startup analyses', 'Full AI insights', 'PDF reports'],
    popular: false
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
    popular: true
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
    popular: false
  }
];

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, onPurchase }) => {
  const [selectedPackage, setSelectedPackage] = React.useState<string | null>(null);
  
  const handlePurchase = () => {
    if (selectedPackage) {
      onPurchase(selectedPackage);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">You're out of free credits!</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                You've used all your free startup analysis credits. Purchase more credits to continue validating your startup ideas.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {CREDIT_PACKAGES.map(pkg => (
                  <div 
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedPackage(pkg.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
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
                      {pkg.features.map((feature) => (
                        <li key={`${pkg.id}-${feature}`} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div>
                  <p className="font-medium mb-1">Secure Payment</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">All transactions are secure and encrypted</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handlePurchase}
                    disabled={!selectedPackage}
                    className={`px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 ${
                      !selectedPackage 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-blue-700'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Purchase Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaywallModal;
