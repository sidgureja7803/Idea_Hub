/**
 * Credit Guard Component
 * Higher-order component to restrict access to submission functionality when credits are depleted
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaywallModal from './PaywallModal';
import { useAuth } from '../../hooks/useAuth';
import { getUserCredits, addCredits } from '../../services/CreditService';

// Credit requirements are handled through the CreditService now

interface CreditGuardProps {
  children: React.ReactNode;
  requiredCredits?: number;
}

const CreditGuard: React.FC<CreditGuardProps> = ({ 
  children, 
  requiredCredits = 1 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user credits on component mount
  useEffect(() => {
    const fetchCredits = async () => {
      setIsLoading(true);
      try {
        if (!user?.id) {
          // If no user is logged in, we can't fetch credits
          return;
        }
        
        // Get user credits from service
        const credits = getUserCredits(user.id);
        
        if (credits) {
          setAvailableCredits(credits.availableCredits);
        } else {
          // New user gets default free credits
          setAvailableCredits(5); // Default free credits
        }
      } catch (error) {
        console.error('Failed to fetch user credits', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCredits();
    }
  }, [user]);

  // Check if user has enough credits when they visit this page
  useEffect(() => {
    if (!isLoading && availableCredits < requiredCredits) {
      setShowPaywall(true);
    }
  }, [availableCredits, requiredCredits, isLoading]);

  const handleCreditPurchase = async (packageId: string) => {
    // Process credit purchase
    if (!user?.id) return;
    
    console.log(`Processing purchase for package: ${packageId}`);
    
    // Simulate API delay for payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Credit amounts from packages
    const creditPackages = [
      { id: 'basic', credits: 5 },
      { id: 'pro', credits: 15 },
      { id: 'business', credits: 50 }
    ];
    
    const selectedPackage = creditPackages.find(pkg => pkg.id === packageId);
    
    if (selectedPackage) {
      // Add credits to user account
      const updatedCredits = addCredits(user.id, selectedPackage.credits);
      
      if (updatedCredits) {
        setAvailableCredits(updatedCredits.availableCredits);
        setShowPaywall(false);
      }
    }
  };

  // If we're still loading credits data, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Show the paywall if user doesn't have enough credits */}
      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => navigate('/dashboard')} 
        onPurchase={handleCreditPurchase} 
      />
      
      {/* Only render children (the submission form) if user has enough credits */}
      {!showPaywall && children}
    </>
  );
};

export default CreditGuard;
