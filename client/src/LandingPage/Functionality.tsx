import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Users, Target, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  delay: number;
}

const Functionality: React.FC = () => {
  const features: FeatureItem[] = [
    {
      icon: <PieChart size={48} className="text-white mb-4" />,
      title: "Market Analysis",
      delay: 0.3
    },
    {
      icon: <BarChart size={48} className="text-white mb-4" />,
      title: "TAM/SAM",
      delay: 0.4
    },
    {
      icon: <Users size={48} className="text-white mb-4" />,
      title: "Competition",
      delay: 0.5
    },
    {
      icon: <Target size={48} className="text-white mb-4" />,
      title: "Strategy",
      delay: 0.6
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column */}
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.h2 
              className="text-3xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Analyze and Validate
              <span className="block text-gray-400 mt-2">Business Ideas</span>
            </motion.h2>
            
            <motion.p 
              className="text-lg text-gray-300 mb-10 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              AI-powered platform for comprehensive market research, competitive analysis, and strategic insights.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Link to="/submit" className="btn-primary px-6 py-3 rounded-lg">
                <span className="mr-2">+</span>
                Add Idea
              </Link>
              <Link to="/dashboard" className="btn-ghost px-6 py-3 rounded-lg border border-gray-700">
                Dashboard
              </Link>
              <Link to="/gallery" className="btn-ghost px-6 py-3 rounded-lg border border-gray-700">
                <span className="mr-2">🖼️</span>
                Public Gallery
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Right Column - Feature Cards */}
          <motion.div 
            className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-primary-500/5"
                variants={itemVariants}
                transition={{ duration: 0.5, delay: feature.delay }}
              >
                {feature.icon}
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Functionality;
