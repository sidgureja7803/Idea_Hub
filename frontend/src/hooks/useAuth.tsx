import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useApi } from '../utils/api';

// Define user type (this extends Clerk's user data)
interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  imageUrl?: string;
  tier: 'free' | 'premium' | 'enterprise';
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
}

// Define user stats type
interface UserStats {
  tier: string;
  searchesUsed: number;
  maxSearches: number;
  remainingSearches: number;
  periodEnd: string;
  canSearch: boolean;
}

// Create auth context types
interface AuthContextType {
  user: User | null;
  userStats: UserStats | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void; // Not needed with Clerk, but kept for interface compatibility
  logout: () => void;
  syncUser: () => Promise<void>;
  refreshStats: () => Promise<void>;
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
  const api = useApi();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Sync user with backend when Clerk user changes
  const syncUser = async () => {
    if (!clerkUser || !clerkIsLoaded) return;
    
    try {
      const response = await api.post('/user/sync');
      if (response.success) {
        setLocalUser(response.user);
        setUserStats(response.stats);
      }
    } catch (error) {
      console.error('Error syncing user:', error);
      // Fallback to basic user data
      setLocalUser({
        id: clerkUser.id,
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        imageUrl: clerkUser.imageUrl || undefined,
        tier: 'free',
        preferences: {
          notifications: true,
          theme: 'auto'
        }
      });
    }
  };

  // Refresh user stats
  const refreshStats = async () => {
    if (!localUser) return;
    
    try {
      const response = await api.get('/user/stats');
      if (response.success) {
        setUserStats(response.stats);
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  // Convert Clerk user to our User type when it changes
  useEffect(() => {
    if (clerkUser && clerkIsLoaded) {
      syncUser();
    } else if (clerkIsLoaded) {
      setLocalUser(null);
      setUserStats(null);
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
    userStats: userStats,
    isAuthenticated: !!localUser,
    isLoading: !clerkIsLoaded,
    login,
    logout,
    syncUser,
    refreshStats
  }), [localUser, userStats, clerkIsLoaded]);

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
