/**
 * Idea Refiner Page
 * Dedicated page for the FoundrIQ Idea Refiner tool
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Brain, 
  Target,
  ArrowRight,
  Play
} from 'lucide-react';
import IdeaRefiner from '../components/IdeaRefiner';
import { IdeaRefinementResult } from '../services/IdeaRefinerService';

const IdeaRefinerPage: React.FC = () => {
  const [sampleIdea, setSampleIdea] = useState('');

  const sampleIdeas = [
    "A mobile app that helps people find and book local fitness classes in real-time, with features like class reviews, instructor ratings, and personalized recommendations based on fitness goals and preferences.",
    "An AI-powered platform that connects freelance graphic designers with small businesses, automatically matching them based on style preferences, budget, and project requirements to streamline the creative process.",
    "A subscription service that delivers personalized meal kits for people with specific dietary restrictions (keto, vegan, gluten-free, etc.), with recipes tailored to their health goals and local ingredient availability.",
    "A social networking app for pet owners that allows them to connect with other pet owners in their area, share pet photos, organize playdates, and find local pet-friendly businesses and services.",
    "A virtual reality platform for remote team building activities, offering immersive experiences like escape rooms, virtual office tours, and collaborative problem-solving games to improve workplace culture."
  ];

  const handleSampleIdea = (idea: string) => {
    setSampleIdea(idea);
  };

  const handleRefined = (result: IdeaRefinementResult) => {
    console.log('Idea refined successfully:', result);
    // You can add additional logic here, like saving to database, analytics, etc.
  };

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
            <Brain className="h-12 w-12 text-purple-400 mr-4" />
            <Sparkles className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            FoundrIQ Idea Refiner
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Transform your raw startup ideas into structured, investor-ready concepts with AI-powered refinement and analysis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-2 text-gray-400">
              <Target className="h-5 w-5" />
              <span>Structured Analysis</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Brain className="h-5 w-5" />
              <span>AI-Powered Insights</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Play className="h-5 w-5" />
              <span>Real-time Processing</span>
            </div>
          </div>
        </motion.div>

        {/* Sample Ideas Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Try with Sample Ideas
            </h3>
            <p className="text-gray-400 mb-6">
              Click on any sample idea below to see how the refiner works:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleIdeas.map((idea, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleIdea(idea)}
                  className="text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-lg transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-purple-400 font-medium text-sm">
                      Sample {index + 1}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {idea.substring(0, 120)}...
                  </p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Refiner Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <IdeaRefiner 
            initialIdea={sampleIdea}
            onRefined={handleRefined}
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
              What You Get
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Comprehensive analysis and structuring of your startup idea
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Structured Analysis
              </h3>
              <p className="text-gray-400 text-sm">
                Break down your idea into clear components: problem, solution, target customers, and value propositions.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Risk Assessment
              </h3>
              <p className="text-gray-400 text-sm">
                Identify key assumptions and potential risks to help you prepare for challenges ahead.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Search Keywords
              </h3>
              <p className="text-gray-400 text-sm">
                Get optimized search keywords for market research and competitive analysis.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <Play className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Complexity Rating
              </h3>
              <p className="text-gray-400 text-sm">
                Understand the complexity level of your idea to plan resources and timeline accordingly.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                User Personas
              </h3>
              <p className="text-gray-400 text-sm">
                Get detailed user personas to better understand your target audience and their needs.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Clarifying Questions
              </h3>
              <p className="text-gray-400 text-sm">
                Receive thoughtful questions to help you refine and validate your idea further.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IdeaRefinerPage;
