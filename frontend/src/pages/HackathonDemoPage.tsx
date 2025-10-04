import React from 'react';
import CerebrasMetrics from '../components/metrics/CerebrasMetrics';

const HackathonDemoPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Hackathon Demo Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Demonstrating Llama models on Cerebras infrastructure
          </p>
        </div>
        
        {/* Architecture Overview */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Architecture Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">🦙</span> Llama Models
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Open-source large language models used for multi-agent reasoning
              </p>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Llama 3 (8B, 70B) - Primary reasoning engines</li>
                <li>• Llama 2 (7B, 13B, 70B) - Fallback models</li>
                <li>• Chain-of-thought reasoning capabilities</li>
                <li>• Structured output generation</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">⚡</span> Cerebras Infrastructure
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                High-performance AI acceleration platform for inference
              </p>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Optimized inference endpoints</li>
                <li>• Low-latency model serving</li>
                <li>• Scalable architecture</li>
                <li>• Advanced model parallelism</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-semibold mb-3">Hybrid Approach</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Our system uses a hybrid approach to optimize for both performance and cost:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <h4 className="font-medium mb-1">Light Tasks</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Simple queries use Llama 3 8B for fast, efficient responses
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <h4 className="font-medium mb-1">Medium Tasks</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Standard analysis uses Llama 3 8B with higher token limits
                </p>
              </div>
              
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                <h4 className="font-medium mb-1">Heavy Tasks</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Complex reasoning uses Llama 3 70B for highest quality results
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Live Metrics */}
        <CerebrasMetrics />
        
        {/* Hackathon Notes */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Hackathon Notes</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p>
              This project demonstrates the use of Llama models on Cerebras infrastructure for 
              multi-agent reasoning and startup idea validation. Key highlights:
            </p>
            
            <ul>
              <li>
                <strong>Llama Models:</strong> We use open-source Llama models (Llama 2 and Llama 3) 
                for all reasoning tasks, satisfying the "Llama / open model" track requirements.
              </li>
              <li>
                <strong>Cerebras Platform:</strong> All model inference is performed via Cerebras API, 
                demonstrating the use of Cerebras as our inference backend.
              </li>
              <li>
                <strong>Complexity-Based Routing:</strong> Tasks are routed to different model sizes 
                based on complexity, optimizing for both quality and performance.
              </li>
              <li>
                <strong>Real-Time Metrics:</strong> The dashboard displays real-time metrics about 
                API usage, model performance, and system throughput.
              </li>
            </ul>
            
            <p>
              The metrics above demonstrate the benefits of using Cerebras for inference with 
              Llama models, including low latency, high throughput, and excellent reasoning capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDemoPage;
