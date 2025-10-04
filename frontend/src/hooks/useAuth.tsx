import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

// Define user type (this extends Clerk's user data)
interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  imageUrl?: string;
  credits?: number; // Number of credits available for analysis
}

// Create auth context types
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void; // Not needed with Clerk, but kept for interface compatibility
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser();
  const { signOut } = useClerk();
  const [localUser, setLocalUser] = useState<User | null>(null);

  // Convert Clerk user to our User type when it changes
  useEffect(() => {
    if (clerkUser && clerkIsLoaded) {
      // Get credits from user metadata or fetch from API in a real implementation
      // For now, providing a default value
      setLocalUser({
        id: clerkUser.id,
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        imageUrl: clerkUser.imageUrl || undefined,
        credits: 5 // Default credits - in a real app, this would come from a database
      });
    } else if (clerkIsLoaded) {
      setLocalUser(null);
    }
  }, [clerkUser, clerkIsLoaded]);

  // Login function - not needed with Clerk but kept for interface compatibility
  const login = () => {
    // Clerk handles login via its components
    console.log('Login is handled by Clerk components');
  };

  // Logout function - uses Clerk's signOut
  const logout = () => {
    signOut();
  };

  // Context value wrapped in useMemo to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user: localUser,
    isAuthenticated: !!localUser,
    isLoading: !clerkIsLoaded,
    login,
    logout
  }), [localUser, clerkIsLoaded]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
