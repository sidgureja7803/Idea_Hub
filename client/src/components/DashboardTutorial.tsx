import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  BarChart3, 
  FileText, 
  Users, 
  Target, 
  Brain,
  Settings
} from 'lucide-react';

interface DashboardTutorialProps {
  onClose: () => void;
  isOpen: boolean;
}

const DashboardTutorial: React.FC<DashboardTutorialProps> = ({ onClose, isOpen }) => {
  const [step, setStep] = useState(0);
  const [showTooltip, setShowTooltip] = useState(true);

  // Reset step when modal reopens
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setShowTooltip(true);
    }
  }, [isOpen]);

  const tutorialSteps = [
    {
      title: "Welcome to IdeaHub",
      description: "Your AI-powered startup validation platform. Let's take a quick tour of how to use our platform to validate your startup ideas.",
      icon: Brain,
      highlight: "welcome"
    },
    {
      title: "Submit Your Idea",
      description: "Start by describing your startup concept and answering a few key questions about your target market and unique value proposition.",
      icon: Search,
      highlight: "submit"
    },
    {
      title: "Multi-Agent AI Analysis",
      description: "Our 8 specialized AI agents will analyze your idea across market potential, competition, feasibility, and strategic recommendations.",
      icon: Brain,
      highlight: "agents"
    },
    {
      title: "View Comprehensive Results",
      description: "See a detailed breakdown of your idea's strengths, weaknesses, opportunities, and potential challenges.",
      icon: BarChart3,
      highlight: "results"
    },
    {
      title: "Download Reports",
      description: "Export your analysis as a professional report in PDF or Markdown format for sharing or future reference.",
      icon: FileText,
      highlight: "reports"
    },
    {
      title: "Refine Your Idea",
      description: "Use the insights to iterate on your concept and run additional analyses as you refine your startup idea.",
      icon: Settings,
      highlight: "refine"
    }
  ];

  const currentStep = tutorialSteps[step];
  const totalSteps = tutorialSteps.length;

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowTooltip(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                  <currentStep.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentStep.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="mb-8">
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {currentStep.description}
                </p>
              </div>
              
              {/* Tutorial visualization based on current step */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-8 min-h-[200px]">
                {currentStep.highlight === "welcome" && (
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="relative"
                    >
                      <div className="flex justify-center items-center h-40">
                        <Brain className="h-20 w-20 text-blue-600 dark:text-blue-400" />
                      </div>
                      <motion.div 
                        className="absolute -top-4 -right-4"
                        animate={{ rotate: [0, 15, 0, 15, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <div className="bg-yellow-400 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                          AI
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                )}

                {currentStep.highlight === "submit" && (
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 w-full max-w-md mb-4 border border-gray-200 dark:border-gray-700"
                    >
                      <h4 className="font-medium mb-2">Startup Idea Form</h4>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-3"></div>
                      <div className="h-10 bg-blue-500 dark:bg-blue-600 rounded w-1/3 mt-4"></div>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2"
                    >
                      Fill out the form with details about your startup idea
                    </motion.div>
                  </div>
                )}

                {currentStep.highlight === "agents" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { name: "Market Analysis", icon: Search, color: "bg-blue-500" },
                      { name: "TAM/SAM Analysis", icon: BarChart3, color: "bg-green-500" },
                      { name: "Competition", icon: Users, color: "bg-purple-500" },
                      { name: "Feasibility", icon: Target, color: "bg-amber-500" },
                      { name: "Strategic Recs", icon: FileText, color: "bg-pink-500" },
                      { name: "Risk Analysis", icon: Settings, color: "bg-red-500" },
                      { name: "Marketing", icon: Users, color: "bg-indigo-500" },
                      { name: "Funding", icon: BarChart3, color: "bg-teal-500" }
                    ].map((agent, index) => (
                      <motion.div
                        key={agent.name}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow flex flex-col items-center"
                      >
                        <div className={`w-8 h-8 rounded-full ${agent.color} flex items-center justify-center mb-2`}>
                          <agent.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-center">{agent.name}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {currentStep.highlight === "results" && (
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 w-full max-w-md border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between mb-4">
                        <h4 className="font-medium">Analysis Results</h4>
                        <div className="flex gap-2">
                          <div className="h-4 w-4 rounded-full bg-green-500"></div>
                          <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                          <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mb-3 items-center">
                        <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                      
                      <div className="h-2 bg-blue-500 rounded-full w-7/12 mb-3"></div>
                      <div className="h-2 bg-green-500 rounded-full w-9/12 mb-3"></div>
                      <div className="h-2 bg-yellow-500 rounded-full w-5/12 mb-3"></div>
                      <div className="h-2 bg-red-500 rounded-full w-3/12 mb-3"></div>
                      
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
                    </motion.div>
                  </div>
                )}

                {currentStep.highlight === "reports" && (
                  <div className="flex justify-center">
                    <div className="flex gap-6">
                      <motion.div
                        initial={{ rotate: -10, y: 20, opacity: 0 }}
                        animate={{ rotate: 0, y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg w-40 h-56"
                      >
                        <div className="flex justify-center mb-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 mx-auto"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="flex justify-center mt-4">
                          <div className="text-xs font-semibold py-1 px-3 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">PDF</div>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ rotate: 10, y: 20, opacity: 0 }}
                        animate={{ rotate: 0, y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg w-40 h-56"
                      >
                        <div className="flex justify-center mb-3">
                          <FileText className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 mx-auto"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="flex justify-center mt-4">
                          <div className="text-xs font-semibold py-1 px-3 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full">MD</div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )}

                {currentStep.highlight === "refine" && (
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative w-64 h-64"
                    >
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                      >
                        <div className="w-64 h-64 rounded-full border-4 border-dashed border-blue-400 dark:border-blue-600"></div>
                      </motion.div>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="w-48 h-48 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 3 }}
                        >
                          <motion.div
                            className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg"
                            animate={{ rotate: [0, 10, 0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 10 }}
                          >
                            <Brain className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                          </motion.div>
                        </motion.div>
                      </div>
                      
                      <motion.div
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                          <Search className="h-5 w-5" />
                        </div>
                      </motion.div>
                      
                      <motion.div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                          <Settings className="h-5 w-5" />
                        </div>
                      </motion.div>
                      
                      <motion.div
                        className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                      >
                        <div className="bg-amber-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                          <Users className="h-5 w-5" />
                        </div>
                      </motion.div>
                      
                      <motion.div
                        className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.1 }}
                      >
                        <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Progress indicators */}
              <div className="flex justify-center gap-1 mb-6">
                {tutorialSteps.map((stepItem, idx) => (
                  <div 
                    key={`step-${stepItem.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === step ? 'w-6 bg-blue-600 dark:bg-blue-400' : 'w-3 bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              
              {/* Footer with navigation */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  disabled={step === 0}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                    step === 0 
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {step === totalSteps - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* First-time tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-10 max-w-sm bg-gray-900 text-white p-4 rounded-lg shadow-lg"
              >
                <p className="text-sm">Click anywhere outside this tutorial to dismiss it. You can access it again from your profile menu.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DashboardTutorial;
