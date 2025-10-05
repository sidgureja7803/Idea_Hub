/**
 * Sign Up Page
 * Displays the Clerk sign-up component with a visually appealing UI
 */

import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, ChevronRight } from 'lucide-react';

// Import technology logos
import clerkLogo from '../assets/images/clerk.svg';
import langchainLogo from '../assets/images/langchain.svg';
import tavilyLogo from '../assets/images/tavily.svg';
import openaiLogo from '../assets/images/openai.svg';

const SignUpPage: React.FC = () => {
  const techLogos = [
    { src: clerkLogo, alt: 'Clerk', delay: 0, id: 'clerk' },
    { src: langchainLogo, alt: 'LangChain', delay: 0.2, id: 'langchain' },
    { src: tavilyLogo, alt: 'Tavily', delay: 0.3, id: 'tavily' },
    { src: openaiLogo, alt: 'OpenAI', delay: 0.4, id: 'openai' }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Left Panel - Technology Showcase */}
      <motion.div 
        className="hidden md:flex md:w-1/2 bg-purple-700 flex-col justify-center items-center p-12 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-blue-700 opacity-90"></div>
        
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
          
          <h2 className="text-2xl font-bold text-white mb-6">Join our platform today</h2>
          
          <p className="text-purple-100 mb-10 text-lg">
            Get access to AI-powered startup analysis tools and comprehensive insights to validate your ideas.
          </p>
          
          {/* Features List */}
          <div className="mb-12 text-left">
            <h3 className="text-white text-xl font-semibold mb-6">What you'll get:</h3>
            
            <ul className="space-y-3 text-white">
              <motion.li 
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="bg-white/20 p-1 rounded-full mr-3 mt-1">
                  <svg className="h-4 w-4 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>Market Analysis and Trends</span>
              </motion.li>
              <motion.li 
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="bg-white/20 p-1 rounded-full mr-3 mt-1">
                  <svg className="h-4 w-4 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>TAM & SAM Analysis</span>
              </motion.li>
              <motion.li 
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="bg-white/20 p-1 rounded-full mr-3 mt-1">
                  <svg className="h-4 w-4 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>Competitive Landscape</span>
              </motion.li>
              <motion.li 
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <span className="bg-white/20 p-1 rounded-full mr-3 mt-1">
                  <svg className="h-4 w-4 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>Feasibility Assessment</span>
              </motion.li>
              <motion.li 
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <span className="bg-white/20 p-1 rounded-full mr-3 mt-1">
                  <svg className="h-4 w-4 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>Strategic Recommendations</span>
              </motion.li>
            </ul>
          </div>
          
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
          className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-blue-500 opacity-20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-purple-400 opacity-20"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.25, 0.2] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
        />
      </motion.div>
      
      {/* Right Panel - Sign Up Form */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Mobile Logo - only visible on mobile */}
        <div className="flex md:hidden items-center justify-center mb-8">
          <div className="relative">
            <Brain className="h-12 w-12 text-purple-600" />
            <Lightbulb className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1" />
          </div>
          <h1 className="ml-3 text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            The Idea Hub
          </h1>
        </div>
        
        <div className="w-full max-w-md">
          {/* Sign Up Form */}
          <motion.div 
            className="bg-white py-8 px-6 shadow-xl rounded-xl sm:px-10 border border-gray-100"
            whileHover={{ boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.1), 0 8px 10px -6px rgba(147, 51, 234, 0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
              <p className="text-gray-600">Start validating your ideas today</p>
            </div>
            
            <SignUp 
              routing="path" 
              path="/sign-up" 
              signInUrl="/sign-in"
              redirectUrl="/sign-up/verify-email-address"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200',
                  footerActionLink: 'text-purple-600 hover:text-purple-800 font-medium',
                  formFieldInput: 'rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500',
                  card: 'shadow-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  dividerLine: 'bg-gray-200',
                  dividerText: 'text-gray-500 mx-3'
                }
              }}
            />
          </motion.div>
          
          {/* Already have an account? Section */}
          <motion.div 
            className="mt-8 text-center bg-purple-50 p-4 rounded-lg border border-purple-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-gray-800 font-medium">Already have an account?</p>
            <a 
              href="/sign-in" 
              className="inline-flex items-center justify-center mt-2 text-purple-600 hover:text-purple-800 font-semibold group"
            >
              Sign in instead
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
          
          {/* Footer Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing up, you agree to our{' '}
              <a href="/terms" className="text-purple-600 hover:text-purple-800 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-purple-600 hover:text-purple-800 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
