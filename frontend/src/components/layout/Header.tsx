import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import UserMenu from '../auth/UserMenu';
import { Brain, Lightbulb, LogIn, UserPlus, Zap, Cpu, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Helper function to render auth section
  const renderAuthSection = () => {
    if (isLoading) {
      return <div className="h-8 w-8 rounded-full animate-pulse bg-dark-700"></div>;
    }
    
    if (isAuthenticated) {
      return <UserMenu showCredits={true} />;
    }
    
    return (
      <div className="flex space-x-3">
        <Link to="/sign-in" className="btn-ghost text-sm py-2 px-4">
          <LogIn size={16} className="mr-2" />
          <span>Sign In</span>
        </Link>
        <Link to="/sign-up" className="btn-primary text-sm py-2 px-4">
          <UserPlus size={16} className="mr-2" />
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
      className="glass-effect sticky top-0 z-50 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-500 to-accent-cyan p-2.5 group-hover:animate-glow transition-all duration-300">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-accent-orange to-accent-purple p-1">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black gradient-text">
                IdeaHub
              </span>
              <span className="text-xs text-dark-400 font-medium">
                Powered by Cerebras
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`${
                isActive('/') 
                  ? 'text-primary-400' 
                  : 'text-dark-300 hover:text-white'
              } transition-colors duration-200 font-medium`}
            >
              Home
            </Link>
            <Link
              to="/submit"
              className={`${
                isActive('/submit') 
                  ? 'text-primary-400' 
                  : 'text-dark-300 hover:text-white'
              } transition-colors duration-200 font-medium`}
            >
              Validate Idea
            </Link>
            <Link
              to="/dashboard"
              className={`${
                isActive('/dashboard') 
                  ? 'text-primary-400' 
                  : 'text-dark-300 hover:text-white'
              } transition-colors duration-200 font-medium`}
            >
              Dashboard
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Hackathon Demo Link */}
            <Link
              to="/hackathon-demo"
              className="flex items-center space-x-2 py-2 px-4 rounded-lg bg-gradient-to-r from-accent-purple to-primary-500 text-white hover:from-accent-purple/80 hover:to-primary-500/80 transition-all duration-200 transform hover:scale-105 font-medium text-sm"
            >
              <Cpu size={16} className="animate-pulse" />
              <span>Live Demo</span>
              <Sparkles size={14} />
            </Link>
            
            {/* Auth or User Menu */}
            {renderAuthSection()}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
