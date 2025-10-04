import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Search,
  Brain,
  BarChart
} from 'lucide-react';
import { AgentEvent } from '../../context/WebSocketContext';

interface TimelineEventsProps {
  events: AgentEvent[];
  loading?: boolean;
}

const TimelineEvents: React.FC<TimelineEventsProps> = ({ events, loading = false }) => {
  // Get icon based on agent ID
  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'idea-normalizer':
        return <Brain className="h-4 w-4" />;
      case 'market-searcher':
        return <Search className="h-4 w-4" />;
      case 'market-sizer':
        return <BarChart className="h-4 w-4" />;
      case 'orchestrator':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get icon based on step
  const getStepIcon = (step: string) => {
    if (step.includes('complete')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (step.includes('error')) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else if (step.includes('start')) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    } else {
      return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Get a readable agent name
  const getAgentName = (agentId: string) => {
    switch (agentId) {
      case 'idea-normalizer':
        return 'Idea Normalizer';
      case 'market-searcher':
        return 'Market Searcher';
      case 'market-sizer':
        return 'Market Sizer';
      case 'orchestrator':
        return 'Orchestrator';
      default:
        return agentId;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Processing Timeline</h3>
        {loading && (
          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </div>
        )}
      </div>

      <div className="space-y-6">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {loading ? 'Waiting for events...' : 'No events to display'}
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-2.5 top-5 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            
            {/* Events */}
            <div className="space-y-8">
              {events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * (events.length - index - 1) }}
                  className="relative pl-8"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 flex items-center justify-center">
                    {getAgentIcon(event.agentId)}
                  </div>
                  
                  {/* Event content */}
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mr-2">
                        {getAgentName(event.agentId)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(event.timestamp)}
                      </span>
                      <div className="ml-auto">
                        {getStepIcon(event.step)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {event.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineEvents;
