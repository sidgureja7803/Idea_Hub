import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import axios from 'axios';

// Base API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Get auth token helper function
  const getAuthToken = async (): Promise<string | null> => {
    if (!clerkUser || !clerkIsLoaded) return null;
    
    try {
      // @ts-ignore - window.Clerk is added by Clerk's script
      const token = await window.Clerk?.session?.getToken();
      return token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Make authenticated API request
  const makeRequest = async (method: string, endpoint: string, data?: any) => {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers
    });
  };

  // Sync user with backend when Clerk user changes
  const syncUser = async () => {
    if (!clerkUser || !clerkIsLoaded) return;
    
    try {
      const response = await makeRequest('post', '/user/sync');
      if (response.data.success) {
        setLocalUser(response.data.user);
        setUserStats(response.data.stats);
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
      const response = await makeRequest('get', '/user/stats');
      if (response.data.success) {
        setUserStats(response.data.stats);
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
