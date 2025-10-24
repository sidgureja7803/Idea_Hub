/**
 * Evidence Extractor Component
 * Component for extracting facts from search keywords using AI
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  X, 
  Loader, 
  AlertCircle, 
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Copy,
  Filter
} from 'lucide-react';
import { 
  evidenceExtractorService, 
  ExtractionResult, 
  ExtractionError,
  Source,
  Fact
} from '../services/EvidenceExtractorService';

interface EvidenceExtractorProps {
  onExtracted?: (result: ExtractionResult) => void;
  initialKeywords?: string[];
  maxSourcesPerKeyword?: number;
  className?: string;
}

const EvidenceExtractor: React.FC<EvidenceExtractorProps> = ({
  onExtracted,
  initialKeywords = [],
  maxSourcesPerKeyword = 6,
  className = ''
}) => {
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [maxSources, setMaxSources] = useState(maxSourcesPerKeyword);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<ExtractionError | null>(null);
  const [activeTab, setActiveTab] = useState<'facts' | 'sources'>('facts');
  const [factFilter, setFactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [copied, setCopied] = useState<string | null>(null);

  const handleAddKeyword = () => {
    const trimmedKeyword = currentKeyword.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword)) {
      setKeywords([...keywords, trimmedKeyword]);
      setCurrentKeyword('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleExtract = async () => {
    const validation = evidenceExtractorService.validateKeywords(keywords);
    if (!validation.isValid) {
      setError({ error: validation.error! });
      return;
    }

    setIsExtracting(true);
    setError(null);
    setResult(null);

    try {
      const extractionResult = await evidenceExtractorService.extractEvidence(
        keywords, 
        maxSources
      );
      setResult(extractionResult);
      onExtracted?.(extractionResult);
    } catch (err) {
      setError(err as ExtractionError);
    } finally {
      setIsExtracting(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getConfidenceIcon = (confidence: 'low' | 'medium' | 'high') => {
    switch (confidence) {
      case 'high':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredFacts = result?.facts.filter(fact => 
    factFilter === 'all' || fact.confidence === factFilter
  ) || [];

  const groupedSources = result ? evidenceExtractorService.groupSourcesByKeyword(result.sources) : {};

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            FoundrIQ Evidence Extractor
          </h3>
        </div>
        
        <div className="space-y-4">
          {/* Keywords Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Keywords
            </label>
            <div className="flex">
              <input
                type="text"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter keyword and press Enter"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isExtracting}
              />
              <button
                onClick={handleAddKeyword}
                disabled={!currentKeyword.trim() || isExtracting}
                className={`px-4 py-2 flex items-center justify-center rounded-r-lg ${
                  !currentKeyword.trim() || isExtracting
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            {/* Keywords Tags */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      disabled={isExtracting}
                      className="ml-2 focus:outline-none"
                    >
                      <X className="h-3.5 w-3.5 hover:text-blue-900 dark:hover:text-blue-100" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Max Sources Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Sources Per Keyword: {maxSources}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={maxSources}
              onChange={(e) => setMaxSources(Number(e.target.value))}
              disabled={isExtracting}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Extract Button */}
          <button
            onClick={handleExtract}
            disabled={isExtracting || keywords.length === 0}
            className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isExtracting || keywords.length === 0
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isExtracting ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Extracting Evidence...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Extract Evidence
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-red-800 dark:text-red-200 font-medium">
                  {error.error}
                </h4>
                {error.message && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {error.message}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('facts')}
                  className={`py-3 px-6 font-medium ${
                    activeTab === 'facts'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Facts ({result.facts.length})
                </button>
                <button
                  onClick={() => setActiveTab('sources')}
                  className={`py-3 px-6 font-medium ${
                    activeTab === 'sources'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Sources ({result.sources.length})
                </button>
              </div>

              {/* Filters */}
              {activeTab === 'facts' && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                    Filter:
                  </span>
                  <select
                    value={factFilter}
                    onChange={(e) => setFactFilter(e.target.value as any)}
                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Confidence</option>
                    <option value="high">High Confidence</option>
                    <option value="medium">Medium Confidence</option>
                    <option value="low">Low Confidence</option>
                  </select>
                </div>
              )}
            </div>

            {/* Facts Tab Content */}
            {activeTab === 'facts' && (
              <div className="space-y-6">
                {filteredFacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFacts.map((fact) => {
                      const confidenceInfo = evidenceExtractorService.formatConfidence(fact.confidence);
                      return (
                        <div 
                          key={fact.id} 
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${confidenceInfo.color}`}>
                              {getConfidenceIcon(fact.confidence)}
                              <span className="ml-1">{confidenceInfo.label}</span>
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {fact.id}
                            </span>
                          </div>

                          <div className="mb-3">
                            <p className="text-gray-900 dark:text-white font-medium">
                              {fact.value}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {fact.context}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <span className="truncate max-w-[180px]">
                                {fact.sourceTitle || 'Unknown source'}
                              </span>
                              <span className="mx-1">•</span>
                              <span>
                                {evidenceExtractorService.formatDate(fact.sourceDate)}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              {fact.sourceUrl && (
                                <a 
                                  href={fact.sourceUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600 dark:hover:text-blue-400"
                                  title="Open source"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => copyToClipboard(fact.value, `fact-${fact.id}`)}
                                className="hover:text-blue-600 dark:hover:text-blue-400"
                                title="Copy fact"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          {copied === `fact-${fact.id}` && (
                            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                              Copied to clipboard!
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      No facts found with the selected confidence level.
                    </p>
                  </div>
                )}

                {result.facts.length > 0 && (
                  <div className="text-center">
                    <button
                      onClick={() => copyToClipboard(
                        JSON.stringify(result.facts, null, 2), 
                        'all-facts'
                      )}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied === 'all-facts' ? 'Copied!' : 'Copy All Facts'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sources Tab Content */}
            {activeTab === 'sources' && (
              <div className="space-y-6">
                {Object.keys(groupedSources).length > 0 ? (
                  <div>
                    {Object.entries(groupedSources).map(([keyword, sources]) => (
                      <div key={keyword} className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                          Keyword: "{keyword}"
                        </h3>
                        <div className="space-y-3">
                          {sources.map((source, index) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                            >
                              <h4 className="text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-start justify-between">
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {source.title}
                                </a>
                                <ExternalLink className="h-4 w-4 flex-shrink-0 ml-2" />
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {source.snippet}
                              </p>
                              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                <span>{evidenceExtractorService.formatDate(source.date)}</span>
                                <button
                                  onClick={() => copyToClipboard(source.url, `source-${keyword}-${index}`)}
                                  className="hover:text-blue-600 dark:hover:text-blue-400"
                                  title="Copy URL"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              {copied === `source-${keyword}-${index}` && (
                                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                                  URL copied to clipboard!
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      No sources found.
                    </p>
                  </div>
                )}

                {result.sources.length > 0 && (
                  <div className="text-center">
                    <button
                      onClick={() => copyToClipboard(
                        JSON.stringify(result.sources, null, 2), 
                        'all-sources'
                      )}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied === 'all-sources' ? 'Copied!' : 'Copy All Sources'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EvidenceExtractor;

