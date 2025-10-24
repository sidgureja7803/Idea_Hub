/**
 * ClerkProvider Component
 * Provides authentication context using Clerk
 */

import React, { ReactNode } from 'react';
import { ClerkProvider as ClerkAuthProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

// Clerk publishable key from environment variables (using Vite's syntax)
// For development, we're using a test key that will work for local testing
// IMPORTANT: Replace this with your actual Clerk key in production via .env
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_YWxsb3dpbmctZG9nZmlzaC0xLmNsZXJrLmFjY291bnRzLmRldiQ';

interface ClerkProviderProps {
  children: ReactNode;
}

/**
 * ClerkProvider component that wraps the application to provide authentication
 */
export const ClerkProvider: React.FC<ClerkProviderProps> = ({ children }) => {
  // Always provide a ClerkProvider to ensure hooks work properly
  // The test key will work for development but should be replaced with real key in .env
  if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
    console.warn('⚠️ Using test Clerk key. Create a .env file with VITE_CLERK_PUBLISHABLE_KEY for production.');
  }

  return (
    <ClerkAuthProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      navigate={(to) => {
        // Handle navigation to email verification page
        if (to.includes('verify-email-address')) {
          window.location.href = '/sign-up/verify-email-address';
          return;
        }
        // Handle other navigations
        window.location.href = to;
      }}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200',
          footerActionLink: 'text-purple-600 hover:text-purple-800 font-medium',
          formFieldInput: 'rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500',
        }
      }}
    >
      {children}
    </ClerkAuthProvider>
  );
};

/**
 * Component that only renders children if user is authenticated,
 * otherwise redirects to sign-in
 */
export const AuthenticatedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  // If no Clerk key is present, consider all routes authenticated for development purposes
  if (!CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }
  
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default ClerkProvider;
