/**
 * Idea Refiner Component
 * Component for refining raw startup ideas using the FoundrIQ Idea Refiner API
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Loader, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  ExternalLink,
  Lightbulb,
  Target,
  Users,
  AlertTriangle,
  Search
} from 'lucide-react';
import { ideaRefinerService, IdeaRefinementResult, IdeaRefinementError } from '../services/IdeaRefinerService';

interface IdeaRefinerProps {
  onRefined?: (result: IdeaRefinementResult) => void;
  initialIdea?: string;
  className?: string;
}

const IdeaRefiner: React.FC<IdeaRefinerProps> = ({ 
  onRefined, 
  initialIdea = '', 
  className = '' 
}) => {
  const [rawIdea, setRawIdea] = useState(initialIdea);
  const [result, setResult] = useState<IdeaRefinementResult | null>(null);
  const [error, setError] = useState<IdeaRefinementError | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleRefine = async () => {
    const validation = ideaRefinerService.validateRawIdea(rawIdea);
    if (!validation.isValid) {
      setError({ error: validation.error! });
      return;
    }

    setIsRefining(true);
    setError(null);
    setResult(null);

    try {
      const refinementResult = await ideaRefinerService.refineIdea(rawIdea);
      setResult(refinementResult);
      onRefined?.(refinementResult);
    } catch (err) {
      setError(err as IdeaRefinementError);
    } finally {
      setIsRefining(false);
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

  const complexityInfo = result ? ideaRefinerService.formatComplexity(result.complexity) : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            FoundrIQ Idea Refiner
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Raw Startup Idea
            </label>
            <textarea
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              placeholder="Describe your startup idea in detail..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              rows={6}
              disabled={isRefining}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {rawIdea.length}/10,000 characters
            </p>
          </div>

          <button
            onClick={handleRefine}
            disabled={isRefining || !rawIdea.trim()}
            className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isRefining || !rawIdea.trim()
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isRefining ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Refining Idea...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Refine Idea
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

      {/* Results Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Complexity Badge */}
            {complexityInfo && (
              <div className="flex items-center justify-center">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${complexityInfo.color}`}>
                  <Target className="h-4 w-4 mr-2" />
                  {complexityInfo.label}
                </span>
              </div>
            )}

            {/* Refined Idea Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Refined Idea
                </h3>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(result.refinedIdea, null, 2), 'idea')}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied === 'idea' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {result.refinedIdea.title}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      One-Line Pitch
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {result.refinedIdea.oneLinePitch}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Problem
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {result.refinedIdea.problem}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Solution
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {result.refinedIdea.solution}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Customers
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {result.refinedIdea.targetCustomers}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      User Persona
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {result.refinedIdea.userPersona}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Value Propositions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Unique Value Propositions
                </h3>
              </div>
              <ul className="space-y-2">
                {result.refinedIdea.uniqueValueProps.map((prop, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{prop}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Search Keywords */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Search className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Search Keywords
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(result.searchKeywords.join(', '), 'keywords')}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied === 'keywords' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.searchKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Assumptions and Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Assumptions
                </h3>
                <ul className="space-y-2">
                  {result.refinedIdea.topAssumptions.map((assumption, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium mr-2 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{assumption}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Top Risks
                  </h3>
                </div>
                <ul className="space-y-2">
                  {result.refinedIdea.topRisks.map((risk, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-xs font-medium mr-2 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Clarifying Questions */}
            {result.clarifyingQuestions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-5 w-5 text-purple-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Clarifying Questions
                  </h3>
                </div>
                <ul className="space-y-3">
                  {result.clarifyingQuestions.map((question, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                        Q{index + 1}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IdeaRefiner;
