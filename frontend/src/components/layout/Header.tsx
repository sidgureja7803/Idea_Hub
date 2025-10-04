import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import UserMenu from '../auth/UserMenu';
import { Sun, Moon, Brain, Lightbulb, LogIn, UserPlus } from 'lucide-react';

const Header: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Helper function to render auth section
  const renderAuthSection = () => {
    if (isLoading) {
      return <div className="h-8 w-8 rounded-full animate-pulse bg-gray-200 dark:bg-gray-700"></div>;
    }
    
    if (isAuthenticated) {
      return <UserMenu showCredits={true} />;
    }
    
    return (
      <div className="flex space-x-2">
        <Link to="/sign-in" className="flex items-center space-x-1 py-2 px-3 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
          <LogIn size={16} />
          <span>Sign In</span>
        </Link>
        <Link to="/sign-up" className="flex items-center space-x-1 py-2 px-3 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200">
          <UserPlus size={16} />
          <span>Sign Up</span>
        </Link>
      </div>
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <Lightbulb className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FoundrIQ
            </span>
          </Link>

          {/* Navigation */}
          {/* <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`${
                isActive('/') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              } transition-colors duration-200`}
            >
              Home
            </Link>
            <Link
              to="/submit"
              className={`${
                isActive('/submit') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              } transition-colors duration-200`}
            >
              Submit Idea
            </Link>
          </nav> */}

          {/* Auth Buttons or User Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Auth or User Menu */}
            {renderAuthSection()}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
