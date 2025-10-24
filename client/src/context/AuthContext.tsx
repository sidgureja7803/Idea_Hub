import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { appwriteAuth } from '../services/appwrite';

// Define user type
interface User {
  $id: string;
  name: string;
  email: string;
  prefs?: {
    // Any user preferences can be added here
    darkMode?: boolean;
    termsAccepted?: boolean;
  };
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Clear error
  const clearError = () => setError(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const currentUser = await appwriteAuth.getCurrentUser();
        if (currentUser) {
          setUser(currentUser as User);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      clearError();
      
      await appwriteAuth.login(email, password);
      const currentUser = await appwriteAuth.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser as User);
        setIsAuthenticated(true);
        navigate('/my-ideas');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err?.message || 'Login failed. Please check your credentials.');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      clearError();
      
      await appwriteAuth.createAccount(email, password, name);
      const currentUser = await appwriteAuth.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser as User);
        setIsAuthenticated(true);
        navigate('/my-ideas');
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err?.message || 'Registration failed. Please try again.');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await appwriteAuth.logout();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/');
    } catch (err: any) {
      console.error('Logout failed:', err);
      setError(err?.message || 'Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
