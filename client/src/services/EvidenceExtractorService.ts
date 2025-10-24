/**
 * Evidence Extractor Service
 * Service for extracting facts and sources from search keywords
 */

import { api } from '../utils/api';

export interface Source {
  keyword: string;
  title: string;
  url: string;
  snippet: string;
  date: string;
}

export interface Fact {
  id: string;
  value: string;
  context: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceDate: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface ExtractionResult {
  sources: Source[];
  facts: Fact[];
}

export interface ExtractionError {
  error: string;
  message?: string;
  rawResponse?: string;
  received?: any;
}

class EvidenceExtractorService {
  /**
   * Extract evidence from search keywords
   */
  async extractEvidence(searchKeywords: string[], maxSourcesPerKeyword: number = 6): Promise<ExtractionResult> {
    try {
      const response = await api.post('/evidence/extract', {
        searchKeywords,
        maxSourcesPerKeyword
      });

      return response.data;
    } catch (error: any) {
      console.error('Error extracting evidence:', error);
      
      // Handle different types of errors
      if (error.response?.data) {
        throw {
          error: error.response.data.error || 'Failed to extract evidence',
          message: error.response.data.message,
          rawResponse: error.response.data.rawResponse,
          received: error.response.data.received
        } as ExtractionError;
      }
      
      throw {
        error: 'Network error',
        message: error.message
      } as ExtractionError;
    }
  }

  /**
   * Alternative endpoint for compatibility
   */
  async extractEvidenceAlt(searchKeywords: string[], maxSourcesPerKeyword: number = 6): Promise<ExtractionResult> {
    try {
      const response = await api.post('/evidence/extract-evidence', {
        searchKeywords,
        maxSourcesPerKeyword
      });

      return response.data;
    } catch (error: any) {
      console.error('Error extracting evidence (alt endpoint):', error);
      
      if (error.response?.data) {
        throw {
          error: error.response.data.error || 'Failed to extract evidence',
          message: error.response.data.message,
          rawResponse: error.response.data.rawResponse,
          received: error.response.data.received
        } as ExtractionError;
      }
      
      throw {
        error: 'Network error',
        message: error.message
      } as ExtractionError;
    }
  }

  /**
   * Check the status of the extraction service
   */
  async getStatus(): Promise<{
    status: string;
    service: string;
    version: string;
    timestamp: string;
  }> {
    try {
      const response = await api.get('/evidence/status');
      return response.data;
    } catch (error: any) {
      console.error('Error checking extraction service status:', error);
      throw new Error('Failed to check service status');
    }
  }

  /**
   * Validate search keywords before sending for extraction
   */
  validateKeywords(keywords: string[]): { isValid: boolean; error?: string } {
    if (!keywords || !Array.isArray(keywords)) {
      return { isValid: false, error: 'Keywords must be an array' };
    }

    if (keywords.length === 0) {
      return { isValid: false, error: 'At least one keyword is required' };
    }

    // Check if any keywords are empty or too short
    const invalidKeywords = keywords.filter(kw => 
      typeof kw !== 'string' || kw.trim().length < 2);
    
    if (invalidKeywords.length > 0) {
      return { isValid: false, error: 'All keywords must be valid strings (min 2 characters)' };
    }

    // Check if there are too many keywords
    if (keywords.length > 10) {
      return { isValid: false, error: 'Maximum 10 keywords allowed' };
    }

    return { isValid: true };
  }

  /**
   * Format confidence for display
   */
  formatConfidence(confidence: 'low' | 'medium' | 'high'): {
    label: string;
    color: string;
    icon: string;
  } {
    switch (confidence) {
      case 'high':
        return {
          label: 'High Confidence',
          color: 'text-green-600 bg-green-100 border-green-200',
          icon: 'check-circle'
        };
      case 'medium':
        return {
          label: 'Medium Confidence',
          color: 'text-yellow-600 bg-yellow-100 border-yellow-200',
          icon: 'alert-circle'
        };
      case 'low':
        return {
          label: 'Low Confidence',
          color: 'text-red-600 bg-red-100 border-red-200',
          icon: 'alert-triangle'
        };
      default:
        return {
          label: 'Unknown Confidence',
          color: 'text-gray-600 bg-gray-100 border-gray-200',
          icon: 'help-circle'
        };
    }
  }

  /**
   * Group sources by keyword
   */
  groupSourcesByKeyword(sources: Source[]): Record<string, Source[]> {
    return sources.reduce((acc, source) => {
      if (!acc[source.keyword]) {
        acc[source.keyword] = [];
      }
      acc[source.keyword].push(source);
      return acc;
    }, {} as Record<string, Source[]>);
  }

  /**
   * Format date string for display
   */
  formatDate(dateStr: string): string {
    if (!dateStr) return 'Unknown date';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr; // Return original if parsing fails
    }
  }
}

export const evidenceExtractorService = new EvidenceExtractorService();
export default evidenceExtractorService;

