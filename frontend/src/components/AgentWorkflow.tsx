/**
 * Agent Workflow Component
 * An interactive visualization of how the 8 specialized AI agents work together
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Search, PieChart, Users, CheckCircle, LineChart, FileText, Lightbulb } from 'lucide-react';

interface AgentProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  index: number;
}

const AgentWorkflow: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState(0);
  
  // Data for the 8 specialized agents
  const agents: AgentProps[] = [
    {
      name: "Idea Interpreter",
      description: "Extracts structured metadata from your startup idea description.",
      icon: <Lightbulb size={24} />,
      color: "bg-yellow-500",
      index: 0
    },
    {
      name: "Market Research",
      description: "Conducts real-time market analysis using Tavily search capabilities.",
      icon: <Search size={24} />,
      color: "bg-blue-500",
      index: 1
    },
    {
      name: "TAM/SAM Agent",
      description: "Calculates total addressable market and serviceable market sizes.",
      icon: <PieChart size={24} />,
      color: "bg-green-500",
      index: 2
    },
    {
      name: "Qloo Taste Agent",
      description: "Analyzes cultural alignment for your target audience.",
      icon: <Brain size={24} />,
      color: "bg-purple-500",
      index: 3
    },
    {
      name: "Competition Scan",
      description: "Maps the competitive landscape and identifies market gaps.",
      icon: <Users size={24} />,
      color: "bg-red-500",
      index: 4
    },
    {
      name: "Feasibility Evaluator",
      description: "Assesses technical and financial viability of your idea.",
      icon: <CheckCircle size={24} />,
      color: "bg-amber-500",
      index: 5
    },
    {
      name: "Strategy Recommender",
      description: "Generates personalized go-to-market strategies.",
      icon: <LineChart size={24} />,
      color: "bg-indigo-500",
      index: 6
    },
    {
      name: "Report Generator",
      description: "Compiles all insights into a comprehensive report.",
      icon: <FileText size={24} />,
      color: "bg-teal-500",
      index: 7
    }
  ];
  
  // Auto-advance the active agent every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % agents.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [agents.length]);
  
  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <motion.h2
          className="text-3xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Powered by 8 Specialized AI Agents
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Our system orchestrates specialized AI agents working in sequence to analyze every aspect of your startup idea.
        </motion.p>
      </div>
      
      <div className="relative py-8">
        {/* Workflow visualization */}
        <div className="relative mx-auto max-w-4xl overflow-hidden">
          <div className="hidden lg:block h-2 bg-gray-200 dark:bg-gray-700 absolute top-[105px] left-0 right-0 z-0" />
          
          {/* Agent nodes on desktop */}
          <div className="hidden lg:grid grid-cols-8 gap-4 relative z-10">
            {agents.map((agent, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div
                  className={`w-14 h-14 rounded-full ${agent.color} flex items-center justify-center text-white shadow-lg transition-all duration-300`}
                  animate={{
                    scale: activeAgent === index ? 1.2 : 1,
                    boxShadow: activeAgent === index ? '0 10px 25px -5px rgba(0, 0, 0, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => setActiveAgent(index)}
                >
                  {agent.icon}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                </motion.div>
                <h4 className="text-sm font-medium text-center mt-2">{agent.name}</h4>
              </motion.div>
            ))}
          </div>
          
          {/* Mobile accordion layout */}
          <div className="lg:hidden space-y-3">
            {agents.map((agent, index) => (
              <motion.div 
                key={index}
                className={`rounded-lg border ${
                  activeAgent === index 
                    ? `border-${agent.color.split('-')[1]}-500` 
                    : 'border-gray-200 dark:border-gray-700'
                } overflow-hidden`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div 
                  className={`p-4 flex items-center gap-3 cursor-pointer ${
                    activeAgent === index ? `bg-${agent.color.split('-')[1]}-50 dark:bg-${agent.color.split('-')[1]}-900/20` : ''
                  }`}
                  onClick={() => setActiveAgent(index)}
                >
                  <div className={`w-10 h-10 rounded-full ${agent.color} flex items-center justify-center text-white`}>
                    {agent.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center text-xs mr-2">
                        {index + 1}
                      </div>
                      <h4 className="font-medium">{agent.name}</h4>
                    </div>
                  </div>
                </div>
                
                {activeAgent === index && (
                  <motion.div 
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{agent.description}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Current agent description (desktop) */}
        <motion.div 
          className="hidden lg:block max-w-2xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
          animate={{ 
            backgroundColor: activeAgent !== null ? `var(--${agents[activeAgent].color.split('-')[1]}-50)` : '',
            borderColor: activeAgent !== null ? `var(--${agents[activeAgent].color.split('-')[1]}-200)` : ''
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${activeAgent !== null ? agents[activeAgent].color : 'bg-gray-500'} flex items-center justify-center text-white flex-shrink-0`}>
              {activeAgent !== null ? agents[activeAgent].icon : null}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">
                {activeAgent !== null ? `Agent ${activeAgent + 1}: ${agents[activeAgent].name}` : 'Select an agent'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {activeAgent !== null ? agents[activeAgent].description : 'Click on any agent to see details'}
              </p>
              
              {/* Sample output visualization based on agent type */}
              {activeAgent !== null && (
                <motion.div 
                  className="mt-4 p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={activeAgent} // Remount when agent changes
                >
                  <div className="text-sm text-gray-500">Sample Output:</div>
                  <div className="font-mono text-xs mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {/* Custom sample output based on agent type */}
                    {activeAgent === 0 && `{
  "domain": "mobility",
  "business_model": "marketplace",
  "target_audience": ["urban professionals", "busy parents"],
  "problem_solved": "efficient last-mile delivery"
}`}
                    {activeAgent === 1 && `Market Analysis:
- Global drone delivery market size: $1.5B (2023)
- Projected CAGR: 41.7% (2023-2030)
- Key drivers: e-commerce growth, last-mile delivery challenges
- Regulatory progress: FAA commercialization framework`}
                    {activeAgent === 2 && `TAM (Total Addressable Market): $28.6B
SAM (Serviceable Available Market): $4.2B
SOM (Serviceable Obtainable Market): $150M
Year 1 Market Capture Potential: 0.5% of SAM`}
                    {activeAgent === 3 && `Cultural Alignment Score: 74/100
- Urban millennial adoption likelihood: High
- Privacy concern factors: Medium
- Sustainability perception: Positive
- Social sharing potential: Moderate`}
                    {activeAgent === 4 && `Top Competitors:
1. Wing (Google/Alphabet) - Market share: 28%
2. Amazon Prime Air - Market share: 22%
3. Zipline - Market share: 15%
4. Flytrex - Market share: 8%

Key Differentiators Needed:
- Sustainable battery technology
- Urban-optimized navigation system`}
                    {activeAgent === 5 && `Technical Feasibility: 72%
Financial Feasibility: 68%
Regulatory Challenges: High
Time to Market: 18-24 months
Initial Capital Required: $3.5M - $5.2M`}
                    {activeAgent === 6 && `Strategy Recommendations:
1. Target dense urban areas with high disposable income
2. Focus on pharmacy and grocery deliveries initially
3. Develop subscription model for recurring revenue
4. Partner with local retailers for last-mile integration
5. Prioritize battery efficiency and noise reduction`}
                    {activeAgent === 7 && `[REPORT COMPILED]
✓ Executive Summary
✓ Market Opportunity Assessment 
✓ Competitive Analysis
✓ TAM/SAM/SOM Breakdown
✓ Implementation Roadmap
✓ Financial Projections
✓ Risk Assessment
✓ Strategic Recommendations`}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Workflow section with arrows */}
      <motion.div 
        className="mt-16 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-xl font-bold mb-6 text-center">How Our Agents Work Together</h3>
        
        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Lightbulb className="text-yellow-500" size={18} />
                <span>Your Startup Idea</span>
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Submit your startup concept and business details</p>
            </div>
            
            {/* Process */}
            <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Brain className="text-blue-500" size={18} />
                <span>AI Agent Pipeline</span>
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">8 specialized agents analyze different aspects sequentially</p>
            </div>
            
            {/* Output */}
            <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <FileText className="text-green-500" size={18} />
                <span>Comprehensive Report</span>
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Detailed analysis, visualizations, and strategic recommendations</p>
            </div>
          </div>
          
          {/* Flow arrows (visible on desktop) */}
          <div className="hidden md:block">
            <div className="absolute left-[30%] top-1/2 transform -translate-y-1/2">
              <motion.div 
                className="w-12 h-2 bg-gray-300 dark:bg-gray-600"
                animate={{ width: [0, 12], opacity: [0, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatType: 'loop' }}
              />
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-gray-300 dark:border-l-gray-600" />
            </div>
            
            <div className="absolute left-[63%] top-1/2 transform -translate-y-1/2">
              <motion.div 
                className="w-12 h-2 bg-gray-300 dark:bg-gray-600"
                animate={{ width: [0, 12], opacity: [0, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatType: 'loop' }}
              />
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-gray-300 dark:border-l-gray-600" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AgentWorkflow;
