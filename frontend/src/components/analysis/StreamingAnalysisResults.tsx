/**
 * StreamingAnalysisResults Component
 * Displays real-time streaming analysis results with progress indicators
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreamingAnalysis } from '../../hooks/useStreamingAnalysis';

// Icons
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  RefreshCw
} from 'lucide-react';

interface StreamingAnalysisResultsProps {
  ideaData?: any;
  onComplete?: (results: any) => void;
  autoStart?: boolean;
}

const taskNames = {
  'market-analysis': 'Market Analysis',
  'tam-sam-analysis': 'Market Sizing (TAM/SAM)',
  'competitive-analysis': 'Competitive Landscape',
  'feasibility-analysis': 'Feasibility Assessment',
  'strategy-recommendations': 'Strategic Recommendations',
};

const StreamingAnalysisResults: React.FC<StreamingAnalysisResultsProps> = ({
  ideaData,
  onComplete,
  autoStart = false,
}) => {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});
  
  // Use our custom streaming hook
  const { 
    state, 
    startAnalysis, 
    stopStreaming, 
    reconnect 
  } = useStreamingAnalysis();
  
  // Toggle a section's expanded state
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Handle form submission
  const handleStartAnalysis = async () => {
    if (!ideaData) return;
    
    try {
      await startAnalysis(ideaData);
    } catch (error) {
      console.error('Failed to start analysis:', error);
    }
  };
  
  // Call onComplete when analysis finishes
  React.useEffect(() => {
    if (state.status === 'completed' && onComplete) {
      onComplete(state.results);
    }
  }, [state.status, state.results, onComplete]);
  
  // Auto-start analysis if needed
  React.useEffect(() => {
    if (autoStart && ideaData && state.status === 'idle') {
      handleStartAnalysis();
    }
  }, [autoStart, ideaData, state.status]);
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      {state.status !== 'idle' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {state.status === 'completed' ? 'Analysis Complete' : 'Analysis in Progress'}
            </span>
            <span className="text-sm font-medium">
              {Math.round(state.progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <motion.div 
              className="bg-blue-600 h-2.5 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${state.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
      
      {/* Analysis Controls */}
      <div className="flex gap-4 mb-6">
        {state.status === 'idle' && (
          <button
            onClick={handleStartAnalysis}
            disabled={!ideaData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Start Analysis
          </button>
        )}
        
        {(state.status === 'connecting' || state.status === 'streaming') && (
          <button
            onClick={stopStreaming}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Stop Analysis
          </button>
        )}
        
        {state.status === 'error' && (
          <button
            onClick={reconnect}
            className="px-4 py-2 flex items-center gap-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Reconnect
          </button>
        )}
      </div>
      
      {/* Error Message */}
      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle size={18} />
            <h3 className="font-medium">Error</h3>
          </div>
          <p className="text-red-800">{state.error}</p>
        </div>
      )}
      
      {/* Tasks Status and Results */}
      <div className="space-y-4">
        {Object.entries(taskNames).map(([taskKey, taskLabel]) => {
          const isExpanded = expandedSections[taskKey];
          const isCompleted = !!state.results[taskKey];
          const isInProgress = state.currentTask === taskKey;
          const hasContent = isCompleted || (state.tokens[taskKey] && state.tokens[taskKey].length > 0);
          
          return (
            <div 
              key={taskKey}
              className="border rounded-lg overflow-hidden"
            >
              {/* Task Header */}
              <div 
                className={`flex justify-between items-center p-4 cursor-pointer ${
                  isCompleted ? 'bg-green-50' : isInProgress ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                onClick={() => hasContent && toggleSection(taskKey)}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle size={18} className="text-green-600" />
                  ) : isInProgress ? (
                    <Loader2 size={18} className="text-blue-600 animate-spin" />
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300" />
                  )}
                  
                  <h3 className="font-medium">
                    {taskLabel}
                  </h3>
                </div>
                
                {hasContent && (
                  <div className="flex items-center">
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-600" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Task Content */}
              <AnimatePresence>
                {isExpanded && hasContent && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-white">
                      {isCompleted ? (
                        <div>
                          <pre className="whitespace-pre-wrap break-words font-mono text-sm bg-gray-50 p-4 rounded">
                            {JSON.stringify(state.results[taskKey], null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div className="font-mono text-sm bg-gray-50 p-4 rounded">
                          {state.tokens[taskKey] || 'Processing...'}
                          {isInProgress && (
                            <span className="inline-block animate-pulse">▋</span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StreamingAnalysisResults;
