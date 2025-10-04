import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Define types for agent events
export interface AgentEvent {
  taskId: string;
  agentId: string;
  step: string;
  message: string;
  outputRef?: string;
  timestamp: string;
}

export interface AgentCompletion {
  taskId: string;
  agentId: string;
  result: any;
  timestamp: string;
}

export interface OrchestrationComplete {
  taskId: string;
  results: any;
  timestamp: string;
}

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  events: AgentEvent[];
  results: Record<string, any>;
  subscribeToTask: (taskId: string) => void;
  unsubscribeFromTask: (taskId: string) => void;
  clearEvents: () => void;
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  connected: false,
  events: [],
  results: {},
  subscribeToTask: () => {},
  unsubscribeFromTask: () => {},
  clearEvents: () => {},
  error: null,
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [results, setResults] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      transports: ['websocket'],
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      setError(null);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setConnected(false);
      setError(`Connection error: ${err.message}`);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(`WebSocket disconnected: ${reason}`);
      setConnected(false);
    });

    return () => {
      console.log('Cleaning up WebSocket connection');
      socketInstance.disconnect();
    };
  }, []);

  // Set up event listeners when socket is available
  useEffect(() => {
    if (!socket) return;

    const agentEventHandler = (event: AgentEvent) => {
      console.log('Agent event received:', event);
      setEvents((prevEvents) => [...prevEvents, event]);
    };

    const agentCompletionHandler = (data: AgentCompletion) => {
      console.log('Agent completion received:', data);
      setResults((prevResults) => ({
        ...prevResults,
        [data.agentId]: data.result,
      }));
    };

    const orchestrationCompleteHandler = (data: OrchestrationComplete) => {
      console.log('Orchestration complete:', data);
      setResults((prevResults) => ({
        ...prevResults,
        complete: true,
        finalResults: data.results,
      }));
    };

    socket.on('agent:event', agentEventHandler);
    socket.on('agent:complete', agentCompletionHandler);
    socket.on('orchestration:complete', orchestrationCompleteHandler);

    return () => {
      socket.off('agent:event', agentEventHandler);
      socket.off('agent:complete', agentCompletionHandler);
      socket.off('orchestration:complete', orchestrationCompleteHandler);
    };
  }, [socket]);

  // Subscribe to task updates
  const subscribeToTask = useCallback((taskId: string) => {
    if (socket && connected) {
      console.log(`Subscribing to task: ${taskId}`);
      socket.emit('subscribe:task', taskId);
      // Clear previous events when subscribing to a new task
      clearEvents();
    }
  }, [socket, connected]);

  // Unsubscribe from task updates
  const unsubscribeFromTask = useCallback((taskId: string) => {
    if (socket && connected) {
      console.log(`Unsubscribing from task: ${taskId}`);
      socket.emit('unsubscribe:task', taskId);
    }
  }, [socket, connected]);

  // Clear events and results
  const clearEvents = useCallback(() => {
    setEvents([]);
    setResults({});
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        connected,
        events,
        results,
        subscribeToTask,
        unsubscribeFromTask,
        clearEvents,
        error,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
