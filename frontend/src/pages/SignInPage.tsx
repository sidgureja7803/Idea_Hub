/**
 * Sign In Page
 * Displays the Clerk sign-in component with a visually appealing UI
 */

import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, ChevronRight } from 'lucide-react';

// Import technology logos
import clerkLogo from '../assets/images/clerk.svg';
import geminiLogo from '../assets/images/gemini.svg';
import langchainLogo from '../assets/images/langchain.svg';
import tavilyLogo from '../assets/images/tavily.svg';
import openaiLogo from '../assets/images/openai.svg';

const SignInPage: React.FC = () => {
  const techLogos = [
    { src: clerkLogo, alt: 'Clerk', delay: 0, id: 'clerk' },
    { src: geminiLogo, alt: 'Gemini Pro', delay: 0.1, id: 'gemini' },
    { src: langchainLogo, alt: 'LangChain', delay: 0.2, id: 'langchain' },
    { src: tavilyLogo, alt: 'Tavily', delay: 0.3, id: 'tavily' },
    { src: openaiLogo, alt: 'OpenAI', delay: 0.4, id: 'openai' }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Left Panel - Technology Showcase */}
      <motion.div 
        className="hidden md:flex md:w-1/2 bg-blue-700 flex-col justify-center items-center p-12 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-purple-700 opacity-90"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <Brain className="h-16 w-16 text-white" />
              <Lightbulb className="h-8 w-8 text-yellow-300 absolute -top-1 -right-1" />
            </div>
            <h1 className="ml-4 text-4xl font-extrabold text-white">
              The Idea Hub
            </h1>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-6">Validate your startup ideas with AI</h2>
          
          <p className="text-blue-100 mb-10 text-lg">
            Our platform uses advanced AI technologies to analyze your startup ideas and provide comprehensive insights.
          </p>
          
          {/* Tech Stack Section */}
          <div className="mt-12">
            <h3 className="text-white text-xl font-semibold mb-6">Powered by cutting-edge technology</h3>
            
            <div className="grid grid-cols-5 gap-4 items-center justify-items-center">
              {techLogos.map((logo) => (
                <motion.div
                  key={logo.id}
                  className="bg-white/10 backdrop-blur-sm p-3 rounded-lg shadow-lg hover:bg-white/20 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: logo.delay + 0.3, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <img src={logo.src} alt={logo.alt} className="h-8 w-auto" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <motion.div 
          className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-purple-500 opacity-20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-blue-400 opacity-20"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.25, 0.2] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
        />
      </motion.div>
      
      {/* Right Panel - Sign In Form */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Mobile Logo - only visible on mobile */}
        <div className="flex md:hidden items-center justify-center mb-8">
          <div className="relative">
            <Brain className="h-12 w-12 text-blue-600" />
            <Lightbulb className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1" />
          </div>
          <h1 className="ml-3 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            The Idea Hub
          </h1>
        </div>
        
        <div className="w-full max-w-md">
          {/* Sign In Form */}
          <motion.div 
            className="bg-white py-8 px-6 shadow-xl rounded-xl sm:px-10 border border-gray-100"
            whileHover={{ boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-gray-600">Sign in to continue to The Idea Hub</p>
            </div>
            
            <SignIn 
              routing="path" 
              path="/sign-in" 
              signUpUrl="/sign-up"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200',
                  footerActionLink: 'text-blue-600 hover:text-blue-800 font-medium',
                  formFieldInput: 'rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500',
                  card: 'shadow-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  dividerLine: 'bg-gray-200',
                  dividerText: 'text-gray-500 mx-3'
                }
              }}
            />
          </motion.div>
          
          {/* Don't have an account? Section */}
          <motion.div 
            className="mt-8 text-center bg-blue-50 p-4 rounded-lg border border-blue-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-gray-800 font-medium">Don't have an account?</p>
            <a 
              href="/sign-up" 
              className="inline-flex items-center justify-center mt-2 text-blue-600 hover:text-blue-800 font-semibold group"
            >
              Create a free account
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
          
          {/* Footer Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-800 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-800 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignInPage;
