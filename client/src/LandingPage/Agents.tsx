import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Cpu, Award } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

const Agents: React.FC = () => {
  const steps: Step[] = [
    {
      number: 1,
      title: "Describe your idea",
      description: "Input your business idea. Our AI asks clarifying questions.",
      icon: <MessageSquare className="w-12 h-12 text-white" />,
      delay: 0.2
    },
    {
      number: 2,
      title: "AI Analysis",
      description: "Watch real-time market research and competitive analysis.",
      icon: <Cpu className="w-12 h-12 text-white" />,
      delay: 0.4
    },
    {
      number: 3,
      title: "Get Insights",
      description: "Receive actionable insights and strategic recommendations.",
      icon: <Award className="w-12 h-12 text-white" />,
      delay: 0.6
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: step.delay }}
            >
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gray-800 mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-transparent rounded-full blur-md"></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                  {step.number}
                </span>
              </div>
              
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              
              <p className="text-gray-400">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Validate Your Business Idea?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join entrepreneurs turning ideas into successful businesses.
          </p>
          
          <a 
            href="/submit"
            className="inline-block px-8 py-4 rounded-lg bg-primary-500 text-white font-medium text-lg hover:bg-primary-600 transition-colors"
          >
            Add Your Idea
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Agents;
