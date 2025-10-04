/**
 * Custom hook for streaming AI analysis results
 * Handles real-time data streaming with error recovery
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Types
export interface StreamingAnalysisOptions {
  baseUrl?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface StreamingAnalysisState {
  analysisId: string | null;
  status: 'idle' | 'connecting' | 'streaming' | 'completed' | 'error';
  results: {
    [taskName: string]: any;
  };
  currentTask: string | null;
  error: string | null;
  tokens: {
    [taskName: string]: string;
  };
  progress: number;
  reconnectCount: number;
}

export interface UseStreamingAnalysisReturn {
  state: StreamingAnalysisState;
  startAnalysis: (ideaData: any) => Promise<string>;
  stopStreaming: () => void;
  reconnect: () => void;
}

// Default state
const defaultState: StreamingAnalysisState = {
  analysisId: null,
  status: 'idle',
  results: {},
  currentTask: null,
  error: null,
  tokens: {},
  progress: 0,
  reconnectCount: 0,
};

// Hook implementation
export const useStreamingAnalysis = (
  options: StreamingAnalysisOptions = {}
): UseStreamingAnalysisReturn => {
  // Options with defaults
  const {
    baseUrl = 'http://localhost:5000/api',
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  // State
  const [state, setState] = useState<StreamingAnalysisState>(defaultState);
  
  // Refs for cleanup and reconnection
  const eventSourceRef = useRef<EventSource | null>(null);
  const analysisCancelledRef = useRef<boolean>(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track tasks for progress calculation
  const totalTasksRef = useRef<number>(5); // Total number of agents/tasks
  const completedTasksRef = useRef<number>(0);

  /**
   * Clean up event source and timeouts
   */
  const cleanupEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  /**
   * Stop streaming
   */
  const stopStreaming = useCallback(() => {
    analysisCancelledRef.current = true;
    cleanupEventSource();
    
    setState((prev) => ({
      ...prev,
      status: prev.analysisId ? 'completed' : 'idle',
    }));
  }, [cleanupEventSource]);

  /**
   * Setup event listeners for streaming
   */
  const setupEventListeners = useCallback((analysisId: string) => {
    if (!analysisId) return;
    
    setState((prev) => ({
      ...prev,
      status: 'connecting',
      error: null,
    }));

    // Create EventSource for SSE connection
    const eventSource = new EventSource(`${baseUrl}/analysis/stream/${analysisId}`);
    eventSourceRef.current = eventSource;

    // Connection established
    eventSource.addEventListener('connection', (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      
      setState((prev) => ({
        ...prev,
        status: 'streaming',
        analysisId: data.analysisId,
      }));
    });

    // Task started
    eventSource.addEventListener('taskStart', (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      
      setState((prev) => ({
        ...prev,
        currentTask: data.taskName,
        tokens: {
          ...prev.tokens,
          [data.taskName]: '',
        },
      }));
    });

    // Token received
    eventSource.addEventListener('token', (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      
      setState((prev) => ({
        ...prev,
        tokens: {
          ...prev.tokens,
          [data.taskName]: (prev.tokens[data.taskName] || '') + data.token,
        },
      }));
    });

    // Task completed
    eventSource.addEventListener('taskComplete', (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      completedTasksRef.current += 1;
      
      setState((prev) => ({
        ...prev,
        results: {
          ...prev.results,
          [data.taskName]: data.result,
        },
        progress: (completedTasksRef.current / totalTasksRef.current) * 100,
      }));
    });

    // Task error
    eventSource.addEventListener('taskError', (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      
      setState((prev) => ({
        ...prev,
        error: `Error in ${data.taskName}: ${data.error}`,
      }));
    });

    // Analysis complete
    eventSource.addEventListener('analysisComplete', (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      
      setState((prev) => ({
        ...prev,
        status: 'completed',
        results: data.results,
        currentTask: null,
        progress: 100,
      }));
      
      cleanupEventSource();
    });

    // Analysis error
    eventSource.addEventListener('analysisError', (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: data.error,
        currentTask: null,
      }));
      
      cleanupEventSource();
    });

    // Generic error
    eventSource.addEventListener('error', () => {
      if (analysisCancelledRef.current) return;
      
      setState((prev) => {
        // Only increment reconnect count if not already at max
        const reconnectCount = prev.reconnectCount < maxReconnectAttempts 
          ? prev.reconnectCount + 1 
          : prev.reconnectCount;
        
        // Update error message
        const error = reconnectCount >= maxReconnectAttempts
          ? 'Connection lost. Maximum reconnection attempts reached.'
          : `Connection lost. Reconnecting (${reconnectCount}/${maxReconnectAttempts})...`;
        
        return {
          ...prev,
          status: reconnectCount >= maxReconnectAttempts ? 'error' : 'connecting',
          error,
          reconnectCount,
        };
      });
      
      cleanupEventSource();
      
      // Attempt to reconnect if within retry limit
      if (state.reconnectCount < maxReconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          setupEventListeners(analysisId);
        }, reconnectInterval);
      }
    });

    return eventSource;
  }, [baseUrl, cleanupEventSource, maxReconnectAttempts, reconnectInterval, state.reconnectCount]);

  /**
   * Start a new analysis
   */
  const startAnalysis = useCallback(
    async (ideaData: any): Promise<string> => {
      try {
        // Reset state
        setState({
          ...defaultState,
          status: 'connecting',
        });
        
        analysisCancelledRef.current = false;
        completedTasksRef.current = 0;
        
        // Start the analysis
        const response = await fetch(`${baseUrl}/analyze-idea`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ideaData),
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Failed to start analysis');
        }
        
        const { analysisId } = await response.json();
        
        // Set up streaming for this analysis
        setupEventListeners(analysisId);
        
        // Update state with the analysis ID
        setState((prev) => ({
          ...prev,
          analysisId,
          status: 'connecting',
        }));
        
        return analysisId;
      } catch (error: any) {
        setState({
          ...defaultState,
          status: 'error',
          error: error.message || 'Failed to start analysis',
        });
        
        throw error;
      }
    },
    [baseUrl, setupEventListeners]
  );

  /**
   * Reconnect to the stream
   */
  const reconnect = useCallback(() => {
    if (!state.analysisId) return;
    
    setState((prev) => ({
      ...prev,
      status: 'connecting',
      reconnectCount: 0,
      error: null,
    }));
    
    setupEventListeners(state.analysisId);
  }, [state.analysisId, setupEventListeners]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupEventSource();
    };
  }, [cleanupEventSource]);

  return {
    state,
    startAnalysis,
    stopStreaming,
    reconnect,
  };
};

export default useStreamingAnalysis;
