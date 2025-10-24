import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';

const FirstPage: React.FC = () => {
  return (
    <section className="min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center py-16 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      <motion.div 
        className="container mx-auto px-4 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          An AI researcher for your projects
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-gray-300 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Document well researched ideas with AI
        </motion.p>
        
        <motion.div
          className="flex justify-center items-center mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <PlayCircle size={56} className="text-white opacity-80 hover:opacity-100 transition-opacity cursor-pointer" />
        </motion.div>
        
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <h2 className="text-2xl md:text-4xl font-semibold text-green-400 mb-4">
            Tropical Mosquito-Proof Travel Socks
          </h2>
          <div className="w-full max-w-3xl mx-auto h-1 bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FirstPage;
