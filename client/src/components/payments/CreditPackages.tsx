/**
 * Credit Packages Component
 * Displays available credit packages and handles purchases via PayPal
 */

import React, { useState, useEffect } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Gift, Zap } from 'lucide-react';

// Types
interface CreditPackage {
  _id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  features: string[];
  popular: boolean;
}

interface CreditPackagesProps {
  userId: string;
  onPurchaseComplete?: (data: any) => void;
  apiBaseUrl?: string;
}

const CreditPackages: React.FC<CreditPackagesProps> = ({
  userId,
  onPurchaseComplete,
  apiBaseUrl = 'http://localhost:5000/api'
}) => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'creating-order' | 'processing' | 'success' | 'error'>('idle');
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  // Fetch available credit packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${apiBaseUrl}/credit-packages`);
        setPackages(response.data);
      } catch (err) {
        console.error('Error fetching credit packages:', err);
        setError('Failed to load credit packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [apiBaseUrl]);

  // Handle package selection
  const handlePackageSelect = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setPurchaseStatus('idle');
    setPurchaseMessage(null);
  };

  // Create PayPal order
  const createOrder = async () => {
    if (!selectedPackage) return null;
    
    try {
      setPurchaseStatus('creating-order');
      
      const response = await axios.post(`${apiBaseUrl}/credits/create-order`, {
        packageId: selectedPackage._id,
        userId
      });
      
      // Return the order ID to PayPal
      return response.data.orderID;
    } catch (err) {
      console.error('Error creating order:', err);
      setPurchaseStatus('error');
      setPurchaseMessage('Failed to create order. Please try again.');
      return null;
    }
  };

  // Capture payment when approved
  const onApprove = async (data: any) => {
    if (!selectedPackage) return;
    
    try {
      setPurchaseStatus('processing');
      
      // Process the payment on our server
      const response = await axios.post(`${apiBaseUrl}/credits/process-payment`, {
        orderID: data.orderID,
        paymentID: data.paymentID,
        payerID: data.payerID,
        packageId: selectedPackage._id,
        userId
      });
      
      // Handle success
      setPurchaseStatus('success');
      setPurchaseMessage(`Successfully purchased ${response.data.credits} credits!`);
      
      // Notify parent component
      if (onPurchaseComplete) {
        onPurchaseComplete(response.data);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setPurchaseStatus('error');
      setPurchaseMessage('Failed to process payment. Please contact support if your credits were not added.');
    }
  };

  // Handle payment errors
  const onError = (err: any) => {
    console.error('PayPal error:', err);
    setPurchaseStatus('error');
    setPurchaseMessage('Payment failed. Please try again or use a different payment method.');
  };

  // Format price with currency symbol
  const formatPrice = (price: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    });
    
    return formatter.format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={18} className="text-red-600" />
          <h3 className="font-medium text-red-600">Error</h3>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Package Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {packages.map((pkg) => (
          <motion.div
            key={pkg._id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`border rounded-xl overflow-hidden ${
              pkg.popular ? 'border-blue-500 shadow-md' : 'border-gray-200'
            } ${selectedPackage?._id === pkg._id ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div 
              className={`p-6 cursor-pointer ${
                pkg.popular ? 'bg-blue-50' : 'bg-white'
              }`}
              onClick={() => handlePackageSelect(pkg)}
            >
              {pkg.popular && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Most Popular
                  </span>
                  <Zap size={16} className="text-blue-600" />
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-3xl font-bold">{formatPrice(pkg.price, pkg.currency)}</span>
              </div>
              
              <div className="mb-4">
                <span className="text-lg font-semibold text-blue-600">
                  {pkg.credits} Credits
                </span>
                <p className="text-gray-600 mt-1">{pkg.description}</p>
              </div>
              
              <div className="space-y-2">
                {pkg.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t">
              <button
                onClick={() => handlePackageSelect(pkg)}
                className={`w-full py-2 px-4 rounded-md ${
                  selectedPackage?._id === pkg._id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-blue-600 text-blue-600'
                }`}
              >
                {selectedPackage?._id === pkg._id ? 'Selected' : 'Select Package'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Purchase UI */}
      {selectedPackage && (
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-xl font-bold mb-4">Complete Your Purchase</h3>
          
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md mb-6">
            <div>
              <span className="text-sm text-gray-600">Selected Package:</span>
              <p className="font-medium">{selectedPackage.name} ({selectedPackage.credits} Credits)</p>
            </div>
            <span className="text-xl font-bold">
              {formatPrice(selectedPackage.price, selectedPackage.currency)}
            </span>
          </div>
          
          {/* Purchase Status */}
          {purchaseStatus === 'creating-order' && (
            <div className="flex justify-center items-center p-4 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <span>Creating your order...</span>
            </div>
          )}
          
          {purchaseStatus === 'processing' && (
            <div className="flex justify-center items-center p-4 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <span>Processing your payment...</span>
            </div>
          )}
          
          {purchaseStatus === 'success' && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-md mb-4">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-green-800">{purchaseMessage}</span>
            </div>
          )}
          
          {purchaseStatus === 'error' && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md mb-4">
              <AlertCircle size={20} className="text-red-600" />
              <span className="text-red-800">{purchaseMessage}</span>
            </div>
          )}
          
          {/* PayPal Buttons */}
          {purchaseStatus !== 'success' && (
            <div className="mt-6">
              <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                style={{ 
                  layout: 'vertical',
                  color: 'blue',
                  shape: 'rect',
                  label: 'pay'
                }}
                disabled={purchaseStatus === 'creating-order' || purchaseStatus === 'processing'}
              />
              
              <div className="mt-4 text-center text-sm text-gray-600">
                <Gift size={16} className="inline mr-1" />
                <span>Credits will be instantly added to your account after payment.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreditPackages;
