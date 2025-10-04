import React, { useState, useEffect } from 'react';
import { useApi } from '../../utils/api';

interface ModelUsage {
  model: string;
  calls: number;
  percentage: string;
}

interface CerebrasMetrics {
  totalCalls: number;
  totalTokens: number;
  totalLatency: number;
  avgLatencyMs: number;
  callsPerMinute: number;
  uptime: string;
  callsByModel: Record<string, number>;
  callsByComplexity: Record<string, number>;
  errors: number;
  hackathon: {
    platform: string;
    models: ModelUsage[];
    modelArchitecture: string;
    inferenceInfrastructure: string;
    averageLatencyMs: number;
    throughputPerMinute: number;
  }
}

const CerebrasMetrics: React.FC = () => {
  const api = useApi();
  const [metrics, setMetrics] = useState<CerebrasMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/metrics/cerebras');
      setMetrics(response.data.metrics);
      setError(null);
    } catch (err) {
      console.error('Error fetching Cerebras metrics:', err);
      setError('Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };
  
  const resetMetrics = async () => {
    try {
      await api.post('/metrics/reset');
      fetchMetrics();
    } catch (err) {
      console.error('Error resetting metrics:', err);
      setError('Failed to reset metrics');
    }
  };
  
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);
  
  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          onClick={fetchMetrics}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!metrics) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <span className="mr-2">🦙</span> Llama on Cerebras Metrics
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={fetchMetrics}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded text-sm"
          >
            Refresh
          </button>
          <button 
            onClick={resetMetrics}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm"
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Hackathon Demo Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Hackathon Demo</h3>
            <p>Llama Models on Cerebras Infrastructure</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Uptime: {metrics.uptime}</p>
          </div>
        </div>
      </div>
      
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
          <h3 className="text-sm uppercase text-blue-700 dark:text-blue-300 font-semibold mb-2">API Calls</h3>
          <p className="text-3xl font-bold">{metrics.totalCalls}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            {metrics.callsPerMinute.toFixed(2)} calls/min
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
          <h3 className="text-sm uppercase text-green-700 dark:text-green-300 font-semibold mb-2">Tokens Generated</h3>
          <p className="text-3xl font-bold">{metrics.totalTokens.toLocaleString()}</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            ~{(metrics.totalTokens / Math.max(metrics.totalCalls, 1)).toFixed(0)} tokens/call
          </p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
          <h3 className="text-sm uppercase text-purple-700 dark:text-purple-300 font-semibold mb-2">Avg Latency</h3>
          <p className="text-3xl font-bold">{metrics.avgLatencyMs.toFixed(0)} ms</p>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
            Total latency: {(metrics.totalLatency / 1000).toFixed(1)}s
          </p>
        </div>
      </div>
      
      {/* Model Usage */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">Model Usage</h3>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          {metrics.hackathon.models.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No model usage data yet</p>
          ) : (
            <div className="space-y-3">
              {metrics.hackathon.models.map((model) => (
                <div key={model.model} className="flex items-center">
                  <div className="w-1/3 text-sm font-medium truncate" title={model.model}>
                    {model.model.split('/').pop()}
                  </div>
                  <div className="w-2/3">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: model.percentage }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                        {model.calls} ({model.percentage})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Task Complexity */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">Task Complexity</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(metrics.callsByComplexity).map(([complexity, count]) => (
            <div 
              key={complexity}
              className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-center"
            >
              <p className="text-sm font-medium capitalize">{complexity}</p>
              <p className="text-xl font-bold mt-1">{count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {metrics.totalCalls > 0 
                  ? ((count / metrics.totalCalls) * 100).toFixed(1) + '%' 
                  : '0%'}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Hackathon Details */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">Hackathon Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Architecture</h4>
            <div className="flex items-center">
              <span className="text-xl mr-2">🦙</span>
              <span className="font-semibold">Llama Models</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Open-source LLMs optimized for reasoning tasks
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Infrastructure</h4>
            <div className="flex items-center">
              <span className="text-xl mr-2">⚡</span>
              <span className="font-semibold">Cerebras Platform</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              High-performance AI inference acceleration
            </p>
          </div>
        </div>
      </div>
      
      {/* Error Tracking */}
      {metrics.errors > 0 && (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Errors</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.errors}</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {((metrics.errors / (metrics.totalCalls + metrics.errors)) * 100).toFixed(2)}% error rate
          </p>
        </div>
      )}
    </div>
  );
};

export default CerebrasMetrics;
