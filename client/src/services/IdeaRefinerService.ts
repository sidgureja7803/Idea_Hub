/**
 * Idea Refiner Service
 * Service for refining startup ideas using the FoundrIQ Idea Refiner API
 */

import { api } from '../utils/api';

export interface RefinedIdea {
  title: string;
  oneLinePitch: string;
  problem: string;
  solution: string;
  targetCustomers: string;
  userPersona: string;
  uniqueValueProps: string[];
  topAssumptions: string[];
  topRisks: string[];
}

export interface IdeaRefinementResult {
  refinedIdea: RefinedIdea;
  searchKeywords: string[];
  clarifyingQuestions: string[];
  complexity: 'low' | 'medium' | 'high';
}

export interface IdeaRefinementError {
  error: string;
  message?: string;
  rawResponse?: string;
  received?: any;
}

class IdeaRefinerService {
  /**
   * Refine a raw startup idea into structured format
   */
  async refineIdea(rawIdea: string): Promise<IdeaRefinementResult> {
    try {
      const response = await api.post('/refiner/refine', {
        rawIdea: rawIdea.trim()
      });

      return response.data;
    } catch (error: any) {
      console.error('Error refining idea:', error);
      
      // Handle different types of errors
      if (error.response?.data) {
        throw {
          error: error.response.data.error || 'Failed to refine idea',
          message: error.response.data.message,
          rawResponse: error.response.data.rawResponse,
          received: error.response.data.received
        } as IdeaRefinementError;
      }
      
      throw {
        error: 'Network error',
        message: error.message
      } as IdeaRefinementError;
    }
  }

  /**
   * Alternative endpoint for compatibility
   */
  async refineIdeaAlt(rawIdea: string): Promise<IdeaRefinementResult> {
    try {
      const response = await api.post('/refiner/refine-idea', {
        rawIdea: rawIdea.trim()
      });

      return response.data;
    } catch (error: any) {
      console.error('Error refining idea (alt endpoint):', error);
      
      if (error.response?.data) {
        throw {
          error: error.response.data.error || 'Failed to refine idea',
          message: error.response.data.message,
          rawResponse: error.response.data.rawResponse,
          received: error.response.data.received
        } as IdeaRefinementError;
      }
      
      throw {
        error: 'Network error',
        message: error.message
      } as IdeaRefinementError;
    }
  }

  /**
   * Check the status of the refinement service
   */
  async getStatus(): Promise<{
    status: string;
    service: string;
    version: string;
    timestamp: string;
  }> {
    try {
      const response = await api.get('/refiner/status');
      return response.data;
    } catch (error: any) {
      console.error('Error checking refinement service status:', error);
      throw new Error('Failed to check service status');
    }
  }

  /**
   * Validate a raw idea before sending for refinement
   */
  validateRawIdea(rawIdea: string): { isValid: boolean; error?: string } {
    if (!rawIdea || typeof rawIdea !== 'string') {
      return { isValid: false, error: 'Idea text is required' };
    }

    const trimmed = rawIdea.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Idea text cannot be empty' };
    }

    if (trimmed.length < 10) {
      return { isValid: false, error: 'Idea text is too short (minimum 10 characters)' };
    }

    if (trimmed.length > 10000) {
      return { isValid: false, error: 'Idea text is too long (maximum 10,000 characters)' };
    }

    return { isValid: true };
  }

  /**
   * Format complexity for display
   */
  formatComplexity(complexity: 'low' | 'medium' | 'high'): {
    label: string;
    color: string;
    description: string;
  } {
    switch (complexity) {
      case 'low':
        return {
          label: 'Low Complexity',
          color: 'text-green-600 bg-green-100',
          description: 'Simple idea with clear implementation path'
        };
      case 'medium':
        return {
          label: 'Medium Complexity',
          color: 'text-yellow-600 bg-yellow-100',
          description: 'Moderate complexity requiring some technical expertise'
        };
      case 'high':
        return {
          label: 'High Complexity',
          color: 'text-red-600 bg-red-100',
          description: 'Complex idea requiring significant resources and expertise'
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-600 bg-gray-100',
          description: 'Complexity level not determined'
        };
    }
  }
}

export const ideaRefinerService = new IdeaRefinerService();
export default ideaRefinerService;
