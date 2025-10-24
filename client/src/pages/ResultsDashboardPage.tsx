import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  BarChart3, 
  Target, 
  CheckCircle, 
  Rocket,
  Download,
  FileText,
  Loader,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Globe,
  Shield,
  LineChart,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { useWebSocket } from '../context/WebSocketContext';
import TimelineEvents from '../components/analysis/TimelineEvents';
import { downloadMarkdownReport, downloadPdfReport } from '../utils/reportExporter';
import useJobPolling, { JobResult } from '../hooks/useJobPolling';
import JobStatusIndicator from '../components/analysis/JobStatusIndicator';

interface AnalysisResult {
  id: string;
  taskId?: string;
  idea: {
    description: string;
    category?: string;
    targetAudience?: string;
    problemSolved?: string;
  };
  results: {
    normalizedIdea?: any;
    marketResearch?: any;
    tamSamSom?: any;
    marketSizing?: any;
    competition?: any;
    feasibility?: any;
    strategy?: any;
  };
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: string;
}

const ResultsDashboardPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('market');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'waiting' | 'processing' | 'completed'>('waiting');
  const [metrics, setMetrics] = useState<any>(null);
  
  // WebSocket integration
  const { subscribeToTask, unsubscribeFromTask, events, results, connected } = useWebSocket();
  
  // Job status polling integration
  const { result: jobResult, loading: jobLoading } = useJobPolling(analysisId);

  const tabs = [
    { id: 'market', label: 'Market Analysis', icon: Search, color: 'blue' },
    { id: 'tam', label: 'TAM/SAM/SOM', icon: BarChart3, color: 'green' },
    { id: 'competition', label: 'Competition', icon: Target, color: 'red' },
    { id: 'feasibility', label: 'Feasibility', icon: CheckCircle, color: 'yellow' },
    { id: 'strategy', label: 'Strategy', icon: Rocket, color: 'purple' },
    { id: 'metrics', label: 'Metrics', icon: LineChart, color: 'blue' }
  ];

  // Process WebSocket events and results
  useEffect(() => {
    if (events.length > 0 || Object.keys(results).length > 0) {
      // Update processing status based on events
      const lastEvent = events[events.length - 1];
      if (lastEvent?.step === 'complete' && lastEvent?.agentId === 'orchestrator') {
        setProcessingStatus('completed');
      } else if (events.length > 0) {
        setProcessingStatus('processing');
      }
      
      // Update analysis result with streaming data
      if (analysisResult && analysisResult.taskId) {
        setAnalysisResult(prev => {
          if (!prev) return null;
          
          const updatedResults = { ...prev.results };
          
          // Add normalized idea if available
          if (results['idea-normalizer']) {
            updatedResults.normalizedIdea = results['idea-normalizer'];
            // Update the idea description with the normalized version
            if (results['idea-normalizer'].description) {
              prev.idea.description = results['idea-normalizer'].description;
            }
            // Set target audience from normalized idea
            if (results['idea-normalizer'].targetAudience) {
              prev.idea.targetAudience = results['idea-normalizer'].targetAudience;
            }
          }
          
          // Add market research if available
          if (results['market-searcher']?.marketResearch) {
            updatedResults.marketResearch = results['market-searcher'].marketResearch;
          }
          
          // Add market sizing if available
          if (results['market-sizer']) {
            updatedResults.marketSizing = results['market-sizer'];
            updatedResults.tamSamSom = {
              tam: results['market-sizer'].tam,
              sam: results['market-sizer'].sam,
              som: results['market-sizer'].som,
            };
          }
          
          // Check if orchestration is complete
          if (results.complete) {
            return {
              ...prev,
              results: updatedResults,
              status: 'completed'
            };
          }
          
          return {
            ...prev,
            results: updatedResults
          };
        });
      }
    }
  }, [events, results, analysisResult]);

  // Cleanup: unsubscribe from task on unmount
  useEffect(() => {
    return () => {
      if (analysisId) {
        unsubscribeFromTask(analysisId);
      }
    };
  }, [analysisId, unsubscribeFromTask]);

  // Fetch metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/api/metrics');
        setMetrics(response.data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
    };
    
    if (activeTab === 'metrics') {
      fetchMetrics();
      
      // Poll for metrics updates every 10 seconds
      const metricsInterval = setInterval(fetchMetrics, 10000);
      return () => clearInterval(metricsInterval);
    }
  }, [activeTab]);

  // Create initial analysis result for streaming updates
  useEffect(() => {
    if (!analysisId) return;
    
    // Check if this is a job ID from new API or older analysis ID
    if (jobResult) {
      // Use the job polling result
      setAnalysisResult({
        id: analysisId,
        taskId: analysisId,
        idea: { 
          description: jobResult.results?.marketSnapshot?.summary || 'Processing your idea...' 
        },
        results: {
          marketResearch: jobResult.results?.marketSnapshot,
          tamSamSom: jobResult.results?.tam,
          competition: jobResult.results?.competition,
          feasibility: jobResult.results?.feasibility,
          strategy: jobResult.results?.aggregated
        },
        status: jobResult.status === 'completed' ? 'completed' : 
               jobResult.status === 'failed' ? 'error' : 'processing',
        createdAt: jobResult.createdAt
      });
      
      setProcessingStatus(
        jobResult.status === 'completed' ? 'completed' : 
        jobResult.status === 'pending' ? 'waiting' : 'processing'
      );
      
      setLoading(false);
    } else {
      // Check if this is a task ID (uuid format) for legacy WebSocket streaming
      const isTaskId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(analysisId);
      
      if (isTaskId && connected && !jobResult) {
        // This is a new analysis with WebSocket streaming (legacy)
        setAnalysisResult({
          id: analysisId,
          taskId: analysisId,
          idea: { description: 'Processing your idea...' },
          results: {},
          status: 'processing',
          createdAt: new Date().toISOString(),
        });
        
        setProcessingStatus('processing');
        
        // Subscribe to task updates
        subscribeToTask(analysisId);
        
        // No need to poll with WebSockets
        setLoading(false);
      } else if (!jobLoading && !jobResult) {
        // This is an older analysis, fetch via API
        const fetchAnalysisResult = async () => {  
          try {
            const response = await axios.get(`/api/analysis/${analysisId}`);
            setAnalysisResult(response.data);
            setLoading(false);
          } catch (err: any) {
            setError('Failed to load analysis results');
            setLoading(false);
          }
        };
    
        fetchAnalysisResult();
        
        // Poll for updates if analysis is still pending
        const interval = setInterval(() => {
          if (analysisResult?.status === 'pending') {
            fetchAnalysisResult();
          }
        }, 5000);
    
        return () => clearInterval(interval);
      }
    }
  }, [analysisId, connected, jobResult, jobLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Analysis Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we retrieve your startup analysis...
          </p>
        </div>
      </div>
    );
  }

  if (error || !analysisResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Analysis Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'We couldn\'t find the requested analysis.'}
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Submit New Idea
          </Link>
        </div>
      </div>
    );
  }

  if (analysisResult.status === 'pending' || analysisResult.status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Analyzing Your Startup Idea
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Job ID: {analysisResult.taskId || analysisResult.id}
                </p>
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content area */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <JobStatusIndicator 
                  status={analysisResult.status === 'error' ? 'failed' : analysisResult.status} 
                  progress={
                    jobResult?.progress || 
                    (processingStatus === 'waiting' ? 0 : 
                    processingStatus === 'processing' ? Math.min(Math.max(events.length * 10, 10), 90) : 100)
                  }
                  currentStage={jobResult?.currentStage || 'Processing your startup idea'}
                />
              </motion.div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <Rocket className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-4" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Analysis in Progress
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our AI agents are analyzing your startup concept
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Your Idea
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {analysisResult.idea.description}
                  </p>
                </div>
                
                {/* Preview of results as they come in */}
                {results['idea-normalizer'] && (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Normalized Idea
                    </h3>
                    {results['idea-normalizer'].title && (
                      <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                        {results['idea-normalizer'].title}
                      </h4>
                    )}
                    {results['idea-normalizer'].description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {results['idea-normalizer'].description}
                      </p>
                    )}
                    {results['idea-normalizer'].keyFeatures && (
                      <div className="mt-3">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Key Features</h5>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                          {results['idea-normalizer'].keyFeatures.map((feature: string, i: number) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Timeline sidebar */}
            <div className="lg:col-span-1">
              <TimelineEvents events={events} loading={processingStatus !== 'completed'} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    const { results } = analysisResult;
    
    switch (activeTab) {
      case 'market':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <TrendingUp className="h-8 w-8 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Market Trends
                </h3>
                <div className="text-gray-600 dark:text-gray-400">
                  {results.marketResearch?.trends ? (
                    Array.isArray(results.marketResearch.trends) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {results.marketResearch.trends.map((trend: string, i: number) => (
                          <li key={i}>{trend}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{results.marketResearch.trends}</p>
                    )
                  ) : (
                    <div className="flex items-center">
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      <span>Analyzing market trends...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <DollarSign className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Market Size
                </h3>
                <div className="text-gray-600 dark:text-gray-400">
                  {results.marketResearch?.marketSize || results.marketSizing?.tam?.value ? (
                    <div>
                      <p className="font-medium text-2xl text-blue-600 dark:text-blue-400">
                        {results.marketResearch?.marketSize || results.marketSizing?.tam?.value}
                      </p>
                      <p className="text-sm mt-1">
                        {results.marketSizing?.tam?.growthRate && (
                          <span className="text-green-600 dark:text-green-400">
                            Growing at {results.marketSizing.tam.growthRate} annually
                          </span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      <span>Calculating market size...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <Globe className="h-8 w-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Competitors
                </h3>
                <div className="text-gray-600 dark:text-gray-400">
                  {results.marketResearch?.competitors ? (
                    <div>
                      <p className="mb-2">{results.marketResearch.competitors.length} competitors identified</p>
                      <ul className="text-sm list-disc list-inside">
                        {results.marketResearch.competitors.slice(0, 3).map((comp: any, i: number) => (
                          <li key={i}>{comp.name}</li>
                        ))}
                        {results.marketResearch.competitors.length > 3 && (
                          <li>+{results.marketResearch.competitors.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      <span>Identifying competitors...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Market Analysis Summary
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                {results.marketResearch?.insights ? (
                  <div>
                    <h4 className="text-lg font-medium mb-4">Key Insights</h4>
                    <ul className="space-y-3">
                      {Array.isArray(results.marketResearch.insights) ? (
                        results.marketResearch.insights.map((insight: string, i: number) => (
                          <li key={i} className="pl-4 border-l-2 border-blue-500">{insight}</li>
                        ))
                      ) : (
                        <p>{results.marketResearch.insights}</p>
                      )}
                    </ul>
                    
                    {results.marketResearch.sources && results.marketResearch.sources.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Sources</h4>
                        <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          {results.marketResearch.sources.slice(0, 3).map((source: any, i: number) => (
                            <li key={i}>{source.title} {source.url ? `(${source.url})` : ''}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <Loader className="h-8 w-8 animate-spin mr-3 text-blue-500" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Analyzing market data and generating insights...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'tam':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  TAM (Total Addressable Market)
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {results.marketSizing?.tam?.value || results.tamSamSom?.tam || '$X.XB'}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {results.marketSizing?.tam?.description || 'Total market demand for your solution'}
                  {results.marketSizing?.tam?.growthRate && (
                    <span className="block mt-1 font-medium">Growth: {results.marketSizing.tam.growthRate}</span>
                  )}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  SAM (Serviceable Addressable Market)
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {results.marketSizing?.sam?.value || results.tamSamSom?.sam || '$XXX.XM'}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {results.marketSizing?.sam?.description || 'Market you can realistically target'}
                  {results.marketSizing?.sam?.growthRate && (
                    <span className="block mt-1 font-medium">Growth: {results.marketSizing.sam.growthRate}</span>
                  )}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  SOM (Serviceable Obtainable Market)
                </h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {results.marketSizing?.som?.value || results.tamSamSom?.som || '$XX.XM'}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {results.marketSizing?.som?.description || 'Market you can realistically capture'}
                  {results.marketSizing?.som?.growthRate && (
                    <span className="block mt-1 font-medium">Growth: {results.marketSizing.som.growthRate}</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Market Sizing Analysis
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                {results.marketSizing?.keyInsights || results.tamSamSom?.analysis ? (
                  <div>
                    {results.marketSizing?.keyInsights ? (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium mb-3">Key Insights</h4>
                        <ul className="space-y-2">
                          {results.marketSizing.keyInsights.map((insight: string, i: number) => (
                            <li key={i} className="pl-4 border-l-2 border-purple-500">{insight}</li>
                          ))}
                        </ul>
                      </div>
                    ) : results.tamSamSom?.analysis ? (
                      <div dangerouslySetInnerHTML={{ __html: results.tamSamSom.analysis }} />
                    ) : null}
                    
                    {results.marketSizing?.marketShare && (
                      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <h4 className="font-medium mb-2">Projected Market Share</h4>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {results.marketSizing.marketShare.percentage}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {results.marketSizing.marketShare.description}
                        </p>
                      </div>
                    )}
                    
                    {results.marketSizing?.methodology && (
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                        <p><strong>Methodology:</strong> {results.marketSizing.methodology}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <Loader className="h-8 w-8 animate-spin mr-3 text-blue-500" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Calculating market sizing metrics...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'competition':
        return (
          <div className="space-y-6">
            {/* Competitor Matrix */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Competitor Matrix
              </h3>
              
              {results.competition?.competitors?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Competitor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Strengths</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weaknesses</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Market Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {results.competition.competitors.map((competitor: any, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {competitor.logo ? (
                                <img className="h-10 w-10 rounded-full mr-3" src={competitor.logo} alt={competitor.name} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                                  <span className="text-sm font-medium">{competitor.name.charAt(0)}</span>
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{competitor.name}</div>
                                {competitor.website && (
                                  <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                                    {competitor.website.replace(/^https?:\/\//i, '')}
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {competitor.strengths?.length > 0 ? (
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {competitor.strengths.map((strength: string, i: number) => (
                                  <li key={i} className="text-gray-600 dark:text-gray-400">{strength}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {competitor.weaknesses?.length > 0 ? (
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {competitor.weaknesses.map((weakness: string, i: number) => (
                                  <li key={i} className="text-gray-600 dark:text-gray-400">{weakness}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {competitor.marketShare ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {competitor.marketShare}
                              </span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">Unknown</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <Loader className="h-8 w-8 animate-spin mr-3 text-blue-500" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Analyzing competitors...
                  </p>
                </div>
              )}
            </div>
            
            {/* Competitive Advantage Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <Shield className="h-8 w-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Your Competitive Advantages
                </h3>
                
                {results.competition?.advantages ? (
                  <ul className="space-y-3">
                    {Array.isArray(results.competition.advantages) ? 
                      results.competition.advantages.map((advantage: string, i: number) => (
                        <li key={i} className="flex">
                          <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="ml-3 text-gray-700 dark:text-gray-300">{advantage}</p>
                        </li>
                      )) : (
                        <p className="text-gray-600 dark:text-gray-400">{results.competition.advantages}</p>
                      )
                    }
                  </ul>
                ) : (
                  <div className="flex items-center py-4">
                    <Loader className="h-4 w-4 animate-spin mr-2 text-purple-500" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Analyzing your advantages...
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <AlertCircle className="h-8 w-8 text-amber-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Challenges to Address
                </h3>
                
                {results.competition?.challenges ? (
                  <ul className="space-y-3">
                    {Array.isArray(results.competition.challenges) ? 
                      results.competition.challenges.map((challenge: string, i: number) => (
                        <li key={i} className="flex">
                          <div className="flex-shrink-0 h-5 w-5 text-amber-500 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="ml-3 text-gray-700 dark:text-gray-300">{challenge}</p>
                        </li>
                      )) : (
                        <p className="text-gray-600 dark:text-gray-400">{results.competition.challenges}</p>
                      )
                    }
                  </ul>
                ) : (
                  <div className="flex items-center py-4">
                    <Loader className="h-4 w-4 animate-spin mr-2 text-amber-500" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Identifying challenges...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'feasibility':
        return (
          <div className="space-y-6">
            {/* Summary Score Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Feasibility Overview
              </h3>
              
              {results.feasibility?.score ? (
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <div className="h-36 w-36 rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="h-40 w-40 -rotate-90">
                        <path 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                          strokeDasharray="100, 100"
                          className="dark:stroke-gray-700"
                        />
                        <path 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={Number(results.feasibility.score) >= 70 ? '#10B981' : 
                                 Number(results.feasibility.score) >= 40 ? '#F59E0B' : '#EF4444'}
                          strokeWidth="3"
                          strokeDasharray={`${results.feasibility.score}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900 dark:text-white">
                            {results.feasibility.score}%
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {Number(results.feasibility.score) >= 70 ? 'Highly Feasible' : 
                             Number(results.feasibility.score) >= 40 ? 'Moderately Feasible' : 'Challenging'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <Loader className="h-8 w-8 animate-spin mr-3 text-blue-500" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Calculating feasibility score...
                  </p>
                </div>
              )}
              
              {/* Key Factors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Technical</h4>
                  <div className="flex items-center">
                    <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${results.feasibility?.factors?.technical || 0}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                      {results.feasibility?.factors?.technical || '?'}%
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Financial</h4>
                  <div className="flex items-center">
                    <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${results.feasibility?.factors?.financial || 0}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                      {results.feasibility?.factors?.financial || '?'}%
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Market</h4>
                  <div className="flex items-center">
                    <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500" 
                        style={{ width: `${results.feasibility?.factors?.market || 0}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                      {results.feasibility?.factors?.market || '?'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Technical and Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <Shield className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Technical Feasibility
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Complexity</span>
                    <div>
                      {results.feasibility?.technical?.complexity ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                          ${results.feasibility.technical.complexity === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 
                          results.feasibility.technical.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : 
                          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'}`}>
                          {results.feasibility.technical.complexity}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Analyzing...</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Required Skills</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {results.feasibility?.technical?.skillLevel || 'Evaluating...'}
                      </span>
                    </div>
                    
                    {results.feasibility?.technical?.skills ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {results.feasibility.technical.skills.map((skill: string, i: number) => (
                          <span key={i} className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Key Technical Challenges</span>
                    {results.feasibility?.technical?.challenges ? (
                      <ul className="mt-2 space-y-1 text-sm">
                        {results.feasibility.technical.challenges.map((challenge: string, i: number) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300 flex items-start">
                            <span className="text-red-500 mr-1">•</span> {challenge}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center py-2">
                        <Loader className="h-3 w-3 animate-spin mr-2" />
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Identifying challenges...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <DollarSign className="h-8 w-8 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Financial Requirements
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Initial Investment</span>
                      <span className="font-medium text-xl text-gray-900 dark:text-white">
                        {results.feasibility?.financial?.initialInvestment || '$XXX,XXX'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {results.feasibility?.financial?.initialBreakdown ? (
                        <div className="mt-2">
                          {Object.entries(results.feasibility.financial.initialBreakdown).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-1 border-t border-gray-200 dark:border-gray-700">
                              <span>{key}</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Monthly Burn Rate</span>
                      <span className="font-medium text-xl text-gray-900 dark:text-white">
                        {results.feasibility?.financial?.monthlyBurn || '$XX,XXX'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {results.feasibility?.financial?.burnBreakdown ? (
                        <div className="mt-2">
                          {Object.entries(results.feasibility.financial.burnBreakdown).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-1 border-t border-gray-200 dark:border-gray-700">
                              <span>{key}</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Estimated Runway</span>
                    <div className="mt-1">
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {results.feasibility?.financial?.runway || '12-18 months'}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {results.feasibility?.financial?.runwayNote || 'Based on initial investment and projected burn rate'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Feasibility Assessment
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                {results.feasibility?.summary ? (
                  <div dangerouslySetInnerHTML={{ __html: results.feasibility.summary }} />
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <Loader className="h-8 w-8 animate-spin mr-3 text-blue-500" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Evaluating technical requirements, risks, and implementation challenges...
                    </p>
                  </div>
                )}
                
                {results.feasibility?.recommendations ? (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {results.feasibility.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex">
                          <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="ml-3 text-gray-700 dark:text-gray-300">{rec}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className="space-y-6">
            {/* System Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Clock className="h-6 w-6 mr-3 text-blue-500" />
                System Performance Metrics
              </h3>
              
              {metrics ? (
                <div className="space-y-8">
                  {/* Overall Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
                    >
                      <div className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">Total Requests</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {metrics.totalRequests}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800"
                    >
                      <div className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">Average Latency</div>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {Math.round(metrics.avgLatencyMs)}ms
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800"
                    >
                      <div className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">Requests/Minute</div>
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {metrics.totalRequests > 0 
                          ? (metrics.totalRequests / Math.max(1, metrics.latencies.length / 60000)).toFixed(2)
                          : '0.00'}
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Latency Chart */}
                  {metrics.latencies.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
                    >
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                        Latency History (ms)
                      </h4>
                      
                      <div className="h-64 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 relative">
                        {/* Simple bar chart visualization */}
                        <div className="flex h-full items-end space-x-2">
                          {metrics.latencies.slice(-20).map((latency: number, index: number) => {
                            const maxLatency = Math.max(...metrics.latencies.slice(-20));
                            const height = (latency / maxLatency) * 100;
                            
                            return (
                              <motion.div 
                                key={index}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ 
                                  duration: 0.5, 
                                  delay: 0.1 * (index / 5),
                                  ease: "easeOut"
                                }}
                                className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-t hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors relative group"
                              >
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  {latency}ms
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                        
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div>
                            {Math.max(...metrics.latencies.slice(-20))}ms
                          </div>
                          <div>0ms</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin mr-3 text-blue-500" />
                  <p className="text-gray-600 dark:text-gray-400">Loading metrics data...</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'strategy':
        return (
          <div className="space-y-6">
            {/* Strategy Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Strategic Roadmap
              </h3>
              
              {results.strategy ? (
                <div className="space-y-8">
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800/50"></div>
                    
                    {results.strategy.roadmap?.map((phase: any, index: number) => (
                      <div key={index} className="relative pl-12 mb-10 pb-2">
                        <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-2 border-blue-500 z-10">
                          <span className="text-blue-700 dark:text-blue-300 font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {phase.title || `Phase ${index + 1}`}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {phase.description || 'Description loading...'}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {phase.timeline || 'Timeline: TBD'}
                          </div>
                          
                          {phase.tasks && phase.tasks.length > 0 && (
                            <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Tasks:</div>
                              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {phase.tasks.map((task: string, i: number) => (
                                  <li key={i} className="flex items-start">
                                    <span className="text-blue-500 mr-1">•</span> {task}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )) || (
                      <div className="pl-12 pb-2">
                        <div className="text-gray-600 dark:text-gray-400">
                          Strategic roadmap is being generated...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <Loader className="h-8 w-8 animate-spin mr-3 text-blue-500" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Generating strategic roadmap...
                  </p>
                </div>
              )}
            </div>
            
            {/* Strategy Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Go-to-Market Strategy */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0V5zm0 10a.75.75 0 10-1.5 0 .75.75 0 001.5 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Go-to-Market Strategy
                </h3>
                
                {results.strategy?.goToMarket ? (
                  <div className="prose dark:prose-invert max-w-none">
                    {typeof results.strategy.goToMarket === 'string' ? (
                      <div dangerouslySetInnerHTML={{ __html: results.strategy.goToMarket }} />
                    ) : Array.isArray(results.strategy.goToMarket) ? (
                      <ul className="space-y-2 list-none pl-0">
                        {results.strategy.goToMarket.map((item: string, i: number) => (
                          <li key={i} className="pl-4 border-l-2 border-blue-500">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{String(results.strategy.goToMarket)}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center py-4">
                    <Loader className="h-4 w-4 animate-spin mr-2 text-blue-500" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Crafting go-to-market strategy...
                    </p>
                  </div>
                )}
              </div>
              
              {/* Monetization Models */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Monetization Models
                </h3>
                
                {results.strategy?.monetization ? (
                  <div>
                    {typeof results.strategy.monetization === 'string' ? (
                      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: results.strategy.monetization }} />
                    ) : Array.isArray(results.strategy.monetization) ? (
                      <div className="space-y-4">
                        {results.strategy.monetization.map((model: any, i: number) => (
                          <div key={i} className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg">
                            <div className="font-medium text-gray-900 dark:text-white mb-1">{model.name || `Model ${i+1}`}</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{model.description}</p>
                            {model.potential && (
                              <div className="flex items-center mt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Revenue Potential:</span>
                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500" 
                                    style={{ width: `${model.potential}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-xs font-medium">{model.potential}%</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">{String(results.strategy.monetization)}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center py-4">
                    <Loader className="h-4 w-4 animate-spin mr-2 text-green-500" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Analyzing monetization models...
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Next Steps and Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Next Steps
              </h3>
              
              {results.strategy?.nextSteps ? (
                <div className="space-y-6">
                  {typeof results.strategy.nextSteps === 'string' ? (
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: results.strategy.nextSteps }} />
                  ) : Array.isArray(results.strategy.nextSteps) ? (
                    <div className="space-y-4">
                      {results.strategy.nextSteps.map((step: any, i: number) => (
                        <div key={i} className="flex">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                            <span className="text-blue-700 dark:text-blue-300 font-bold">{i+1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">{step.title || `Step ${i+1}`}</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                            {step.timeline && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{step.timeline}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">{String(results.strategy.nextSteps)}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <Loader className="h-8 w-8 animate-spin mr-3 text-blue-500" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Planning your next steps...
                  </p>
                </div>
              )}
              
              {results.strategy?.keyMetrics && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key Metrics to Track</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.strategy.keyMetrics.map((metric: any, i: number) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">{metric.name}</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{metric.description}</p>
                        {metric.target && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">Target: {metric.target}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Startup Analysis Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {analysisResult.idea.category} • {new Date(analysisResult.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex space-x-4">
              <Link
                to={`/report/${analysisId}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Full Report
              </Link>
              
              <div className="relative">
                <button 
                  onClick={() => document.getElementById('downloadOptions')?.classList.toggle('hidden')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </button>
                
                <div id="downloadOptions" className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => downloadMarkdownReport(analysisResult)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => downloadPdfReport(analysisResult)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <JobStatusIndicator 
            status={analysisResult.status === 'error' ? 'failed' : 'completed'} 
            progress={100}
            currentStage="Analysis completed successfully"
          />
        </motion.div>
        
        {/* Idea Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Startup Idea
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {analysisResult.idea.description}
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? `border-${tab.color}-500 text-${tab.color}-600 dark:text-${tab.color}-400`
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2 inline" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResultsDashboardPage;
