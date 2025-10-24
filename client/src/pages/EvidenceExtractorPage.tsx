/**
 * Evidence Extractor Page
 * Dedicated page for the FoundrIQ Evidence Extractor tool
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileSearch,
  Database,
  BarChart,
  BookOpen,
  CheckCircle
} from 'lucide-react';
import EvidenceExtractor from '../components/EvidenceExtractor';
import { ExtractionResult } from '../services/EvidenceExtractorService';

const EvidenceExtractorPage: React.FC = () => {
  const sampleKeywords = [
    ["artificial intelligence market size", "AI startups funding", "machine learning trends"],
    ["electric vehicle market growth", "EV charging infrastructure", "battery technology advancements"],
    ["telemedicine adoption rate", "virtual healthcare market", "remote patient monitoring"],
    ["sustainable fashion market", "eco-friendly textiles", "circular economy clothing"]
  ];

  const handleExtracted = (result: ExtractionResult) => {
    console.log('Evidence extracted successfully:', result);
    // You can add additional logic here, like saving to database, analytics, etc.
  };

  const [selectedSample, setSelectedSample] = React.useState<string[]>([]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <FileSearch className="h-12 w-12 text-blue-400" />
              <Search className="h-6 w-6 text-yellow-400 absolute -bottom-1 -right-1" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            FoundrIQ Evidence Extractor
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Extract factual evidence and sources from search keywords to validate your startup hypothesis.
          </p>
        </motion.div>

        {/* Sample Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Try with Sample Keywords
            </h3>
            <p className="text-gray-400 mb-6">
              Click on any sample set below to see how the evidence extractor works:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleKeywords.map((keywords, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSample(keywords)}
                  className="text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-lg transition-all duration-200"
                >
                  <h4 className="text-blue-400 font-medium mb-2">Sample Set {index + 1}</h4>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, idx) => (
                      <span 
                        key={idx}
                        className="inline-block bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Extractor Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <EvidenceExtractor 
            initialKeywords={selectedSample}
            onExtracted={handleExtracted}
            className="bg-gray-900 rounded-lg border border-gray-800 p-6"
          />
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our Evidence Extractor uses AI to analyze search results and extract factual data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Search Analysis
              </h3>
              <p className="text-gray-400 text-sm">
                Submit keywords related to your startup idea to retrieve the latest information and search results.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Fact Extraction
              </h3>
              <p className="text-gray-400 text-sm">
                Our AI identifies and extracts concrete facts, statistics, and metrics from the search results.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Confidence Scoring
              </h3>
              <p className="text-gray-400 text-sm">
                Each extracted fact is assigned a confidence score to help you evaluate its reliability.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Market Metrics
              </h3>
              <p className="text-gray-400 text-sm">
                Get specific market sizes, growth rates, competitor metrics, and pricing information.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Source Tracking
              </h3>
              <p className="text-gray-400 text-sm">
                Every fact is linked to its source, letting you verify information and explore further.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <FileSearch className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Easy Export
              </h3>
              <p className="text-gray-400 text-sm">
                Copy all extracted facts and sources to use in your business plans, presentations, or further analysis.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Usage Examples Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Use Cases
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              How founders are using the Evidence Extractor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Market Sizing
              </h3>
              <p className="text-gray-400 mb-4">
                Extract precise TAM, SAM, and SOM figures from reliable sources to build convincing business cases and pitch decks.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="text-blue-400">Example keywords:</span> "industry market size", "growth forecast", "customer segments"
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Competitor Analysis
              </h3>
              <p className="text-gray-400 mb-4">
                Research competitor metrics, funding rounds, pricing strategies, and market share to understand the competitive landscape.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="text-blue-400">Example keywords:</span> "competitor market share", "pricing strategy", "funding rounds"
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Industry Trends
              </h3>
              <p className="text-gray-400 mb-4">
                Stay ahead by extracting facts about emerging trends, technological advancements, and shifting consumer preferences.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="text-blue-400">Example keywords:</span> "industry trends", "emerging technology", "consumer behavior shift"
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Regulatory Research
              </h3>
              <p className="text-gray-400 mb-4">
                Extract information about regulations, compliance requirements, and legal considerations affecting your industry.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="text-blue-400">Example keywords:</span> "industry regulations", "compliance requirements", "legal framework"
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EvidenceExtractorPage;

