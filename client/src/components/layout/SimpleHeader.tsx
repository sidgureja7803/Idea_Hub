import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, LogIn, UserPlus } from 'lucide-react';

/**
 * A simplified header for unauthenticated pages that doesn't use the useAuth hook
 */
const SimpleHeader: React.FC = () => {
  const location = useLocation();
  
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
              to="/validate-idea"
              className={`${
                isActive('/validate-idea') 
                  ? 'text-primary-400' 
                  : 'text-dark-300 hover:text-white'
              } transition-colors duration-200 font-medium`}
            >
              Validate Idea
            </Link>
          </nav>

          {/* Auth Links */}
          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default SimpleHeader;
