import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Server, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

const CerebrasAppwriteSection: React.FC = () => {
  const technologies = [
    {
      name: 'Cerebras',
      icon: <img src="https://cerebras.net/wp-content/uploads/2022/05/cerebras-logo.svg" alt="Cerebras Logo" className="w-12 h-12" />,
      description: 'Ultra-fast AI inference with Cerebras hardware acceleration.',
      details: 'Powered by Llama 3 and Llama 3.3 models on specialized hardware.',
    },
    {
      name: 'Appwrite',
      icon: <img src="https://appwrite.io/images/appwrite.svg" alt="Appwrite Logo" className="w-12 h-12" />,
      description: 'Secure, scalable backend infrastructure with Appwrite.',
      details: 'Authentication, database, and storage managed by Appwrite Cloud.',
    },
  ];

  const features = [
    {
      icon: <Zap size={24} className="text-accent-purple" />,
      title: 'Ultra-Fast AI Analysis',
      description: 'Cerebras infrastructure delivers results in seconds, not minutes.',
    },
    {
      icon: <Shield size={24} className="text-accent-cyan" />,
      title: 'Enterprise-Grade Security',
      description: 'Appwrite provides secure authentication and data management.',
    },
    {
      icon: <Server size={24} className="text-accent-emerald" />,
      title: 'Scalable Infrastructure',
      description: 'Built to handle thousands of concurrent analysis jobs.',
    },
    {
      icon: <Code size={24} className="text-accent-orange" />,
      title: 'Open Architecture',
      description: 'API-first design lets you integrate with existing systems.',
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Powered by Industry-Leading Technology
          </motion.h2>
          <motion.p
            className="text-lg text-dark-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            We've partnered with cutting-edge technologies to deliver the most powerful 
            startup validation platform available.
          </motion.p>
        </div>
        
        {/* Core Technologies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              className="bg-dark-900/50 backdrop-blur-sm border border-dark-800 rounded-xl p-8 hover:shadow-lg hover:shadow-primary-500/10 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="p-4 bg-dark-800/50 rounded-xl flex items-center justify-center">
                  {tech.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{tech.name}</h3>
                  <p className="text-dark-300 mb-3">{tech.description}</p>
                  <p className="text-dark-500 text-sm">{tech.details}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-dark-900/30 border border-dark-800 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
              <p className="text-dark-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Legal Links */}
        <div className="mt-16 text-center">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-4">Legal & Privacy</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/privacy" className="text-primary-400 hover:text-primary-300 underline text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-primary-400 hover:text-primary-300 underline text-sm">
                Terms of Service
              </Link>
              <Link to="/terms" className="text-primary-400 hover:text-primary-300 underline text-sm">
                Cookie Policy
              </Link>
            </div>
          </motion.div>
          
          <p className="text-dark-500 text-xs max-w-xl mx-auto">
            By using IdeaHub, you agree to our Terms of Service and Privacy Policy. We use Cerebras and Appwrite 
            technologies to provide our services. All data is processed according to our data processing guidelines.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CerebrasAppwriteSection;
