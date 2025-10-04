import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DashboardTutorial from '../components/DashboardTutorial';
import CreditSystem from '../components/user/CreditSystem';
import SearchHistory from '../components/user/SearchHistory';
import NewIdeaForm from '../components/forms/NewIdeaForm';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Lightbulb,
  Search, 
  BarChart3, 
  Rocket,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  Info,
  X,
  ChevronDown,
  Menu as MenuIcon,
  Play,
  Star
} from 'lucide-react';

const HomePage: React.FC = () => {
  // State variables
  const [showTutorial, setShowTutorial] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const { user } = useAuth();
  
  // Refs for scroll interactions
  const heroRef = useRef<HTMLDivElement>(null);
  const featureRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  // Handler functions
  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };
  
  const handleDismissBanner = () => {
    setShowWelcomeBanner(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };
  
  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Tutorial Modal */}
      <DashboardTutorial isOpen={showTutorial} onClose={handleCloseTutorial} />
      
      {/* Welcome Banner */}
      <AnimatePresence>
        {showWelcomeBanner && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white relative z-30"
          >
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5" />
                <p>
                  Welcome{user?.firstName ? `, ${user.firstName}` : ''}! Get familiar with the platform by taking the{' '}
                  <button 
                    onClick={() => setShowTutorial(true)}
                    className="font-medium underline underline-offset-2 hover:text-blue-100 ml-1"
                  >
                    guided tutorial
                  </button>
                </p>
              </div>
              <button
                onClick={handleDismissBanner}
                className="text-white hover:text-blue-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modern Navbar */}
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-20 border-b border-gray-200 dark:border-gray-800">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 relative">
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
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a onClick={() => scrollToSection(featureRef)} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium cursor-pointer">
              Features
            </a>
            <a onClick={() => scrollToSection(demoRef)} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium cursor-pointer">
              How It Works
            </a>
            {user ? (
              <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                Dashboard
              </Link>
            ) : (
              <a onClick={() => scrollToSection(pricingRef)} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium cursor-pointer">
                Pricing
              </a>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.credits || 0} credits
                </span>
                <Link 
                  to="/account" 
                  className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full px-3 py-1.5 transition-colors duration-200"
                >
                  <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                    {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium">{user.firstName || 'Account'}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/sign-in" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Log In
                </Link>
                <Link 
                  to="/sign-up" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Open menu"
            >
              <MenuIcon size={20} />
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                <a onClick={() => scrollToSection(featureRef)} className="text-gray-700 dark:text-gray-300 font-medium py-2 cursor-pointer">
                  Features
                </a>
                <a onClick={() => scrollToSection(demoRef)} className="text-gray-700 dark:text-gray-300 font-medium py-2 cursor-pointer">
                  How It Works
                </a>
                {!user && (
                  <a onClick={() => scrollToSection(pricingRef)} className="text-gray-700 dark:text-gray-300 font-medium py-2 cursor-pointer">
                    Pricing
                  </a>
                )}
                {user ? (
                  <div className="flex justify-between items-center py-2">
                    <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 font-medium">Dashboard</Link>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{user.credits || 0} credits</span>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Link to="/sign-in" className="text-gray-700 dark:text-gray-300 font-medium">Log In</Link>
                    <Link to="/sign-up" className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 text-center transition-colors duration-200">Sign Up</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-transparent dark:from-gray-950 dark:via-gray-900 dark:to-gray-950/50 pt-12 pb-24">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl opacity-70"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 rounded-full bg-purple-100 dark:bg-purple-900/20 blur-3xl opacity-70"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center">
            {/* Hero Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                  <span className="block text-gray-900 dark:text-white">Validate Your</span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Startup Ideas
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-lg leading-relaxed">
                  Get real-time market analysis, competitive intelligence, and strategic insights powered by advanced AI agents. Validate your startup concept in minutes, not weeks.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to={user ? '/submit' : '/sign-up'}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {user ? 'Analyze New Idea' : 'Start For Free'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  
                  <button 
                    onClick={() => setShowTutorial(true)} 
                    className="inline-flex items-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </button>
                </div>
                
                <div className="mt-8 flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800"></div>
                    ))}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Trusted by 500+ founders</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Idea Analysis Form */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analyze Your Idea</h2>
                  {user && (
                    <div className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                      {user.credits || 0} credits
                    </div>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Enter your concept below for instant AI-powered analysis
                </p>
              </div>
              
              <NewIdeaForm />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Validate Your Startup Idea?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of entrepreneurs who trust our AI-powered analysis to make informed decisions about their ventures.
            </p>
            <Link
              to={user ? '/submit' : '/sign-up'}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {user ? 'Start New Analysis' : 'Get Started Free'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
