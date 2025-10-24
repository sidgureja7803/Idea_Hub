/**
 * Report Download Component
 * Component that demonstrates and provides download functionality for reports
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, PieChart, LineChart, BarChart3, FileDown, ChevronDown } from 'lucide-react';

interface ReportDownloadProps {
  className?: string;
}

const ReportDownload: React.FC<ReportDownloadProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'markdown'>('pdf');
  
  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: FileText },
    { value: 'markdown', label: 'Markdown', icon: FileDown }
  ];
  
  // Demo only - in a real app this would fetch from the backend
  const handleDownload = (format: 'pdf' | 'markdown') => {
    // This is a demo function that would normally trigger the backend API call
    // For demo purposes, we'll just show an alert
    alert(`In the full app, this would download the ${format.toUpperCase()} report`);
  };
  
  return (
    <div className={`${className} max-w-4xl mx-auto`}>
      <div className="text-center mb-12">
        <motion.h2
          className="text-3xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Comprehensive Report Downloads
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Generate detailed reports with actionable insights for your startup idea
        </motion.p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Report Features */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold mb-4">What's included in your report?</h3>
          
          <div className="space-y-4">
            {[
              {
                icon: <LineChart className="text-blue-500" size={20} />,
                title: 'Market Analysis',
                description: 'Trends, growth projections, and market size calculations'
              },
              {
                icon: <PieChart className="text-green-500" size={20} />,
                title: 'TAM/SAM/SOM Breakdown',
                description: 'Detailed market sizing with visualizations'
              },
              {
                icon: <BarChart3 className="text-purple-500" size={20} />,
                title: 'Competitive Landscape',
                description: 'Analysis of competitors and market positioning'
              },
              {
                icon: <FileText className="text-amber-500" size={20} />,
                title: 'Strategic Recommendations',
                description: 'Actionable insights and next steps'
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="mt-1">{item.icon}</div>
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Report Download Demo */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Preview header */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-blue-500" size={20} />
                <h3 className="font-medium">Report Preview</h3>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            
            {/* Report preview content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-xl font-bold mb-1">Mobile Pet Grooming Service</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Analysis Report</p>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-blue-600 dark:text-blue-400">Market Opportunity</h5>
                  <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <motion.div
                      className="h-4 bg-blue-500 rounded-full"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "75%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    ></motion.div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">75% - Strong market opportunity</p>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-green-600 dark:text-green-400">Competitive Advantage</h5>
                  <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <motion.div
                      className="h-4 bg-green-500 rounded-full"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "60%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.7 }}
                    ></motion.div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">60% - Moderate advantage</p>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-purple-600 dark:text-purple-400">Feasibility Score</h5>
                  <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <motion.div
                      className="h-4 bg-purple-500 rounded-full"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "82%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.9 }}
                    ></motion.div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">82% - Highly feasible</p>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  <p>...continued in full report</p>
                </div>
              </div>
              
              {/* Download section */}
              <div className="mt-8">
                <p className="text-sm font-medium mb-3">Download full report:</p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Format selector */}
                  <div className="relative">
                    <button 
                      className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <div className="flex items-center gap-2">
                        {selectedFormat === 'pdf' ? <FileText size={16} /> : <FileDown size={16} />}
                        <span>{selectedFormat === 'pdf' ? 'PDF Document' : 'Markdown'}</span>
                      </div>
                      <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-10">
                        {formatOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                selectedFormat === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                              }`}
                              onClick={() => {
                                setSelectedFormat(option.value as 'pdf' | 'markdown');
                                setIsOpen(false);
                              }}
                            >
                              <Icon size={16} />
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Download button */}
                  <motion.button
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload(selectedFormat)}
                  >
                    <Download size={16} />
                    <span>Download Report</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportDownload;
