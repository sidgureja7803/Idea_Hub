import { useState, useEffect } from 'react';
import axios from 'axios';

export interface JobResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStage: string;
  createdAt: string;
  updatedAt: string;
  results?: {
    marketSnapshot?: any;
    tam?: any;
    competition?: any;
    feasibility?: any;
    aggregated?: any;
  };
  error?: string;
}

/**
 * Custom hook for polling job status from the API
 * @param jobId The ID of the job to poll
 * @param interval Polling interval in milliseconds (default: 2000ms)
 * @returns JobResult, loading state, and error
 */
export const useJobPolling = (jobId: string | null | undefined, interval = 2000) => {
  const [result, setResult] = useState<JobResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    const fetchJobStatus = async () => {
      try {
        const response = await axios.get(`/api/jobs/${jobId}`);
        const jobData = response.data;

        setResult(jobData);
        
        // Stop polling if the job is completed or failed
        if (['completed', 'failed'].includes(jobData.status)) {
          setIsPolling(false);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching job status:', err);
        setError(err.response?.data?.message || 'Failed to fetch job status');
        setLoading(false);
        setIsPolling(false);
      }
    };

    // Initial fetch
    fetchJobStatus();

    // Set up polling
    let pollTimer: number | null = null;
    
    if (isPolling) {
      pollTimer = window.setInterval(fetchJobStatus, interval);
    }

    // Clean up
    return () => {
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, [jobId, interval, isPolling]);

  return { result, loading, error, isPolling };
};

export default useJobPolling;
