/**
 * ClerkProvider Component
 * Provides authentication context using Clerk
 */

import React, { ReactNode } from 'react';
import { ClerkProvider as ClerkAuthProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

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
    <ClerkAuthProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
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
