import React from 'react';
import { motion } from 'framer-motion';
import FirstPage from '../LandingPage/FirstPage.tsx';
import Functionality from '../LandingPage/Functionality.tsx';
import Agents from '../LandingPage/Agents.tsx';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      
      <motion.main 
        className="flex-grow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <FirstPage />
        <Functionality />
        <Agents />
      </motion.main>

    </div>
  );
};

export default LandingPage;