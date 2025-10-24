import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />
      
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="text-9xl font-bold text-gray-800">404</div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl font-bold text-white">404</div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/"
              className="btn-primary px-6 py-3 rounded-lg inline-flex items-center justify-center gap-2"
            >
              <Home size={18} />
              <span>Back to Home</span>
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="btn-ghost px-6 py-3 rounded-lg border border-gray-700 inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              <span>Go Back</span>
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
