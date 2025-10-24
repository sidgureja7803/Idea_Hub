import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ideaService } from '../services/appwrite';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Calendar, Download, ArrowLeft, User, AlertCircle, Share } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface Idea {
  $id: string;
  userId: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  analysisResults: any;
}

const IdeaDetailsPage: React.FC = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchIdea = async () => {
      if (!ideaId) {
        navigate('/my-ideas');
        return;
      }
      
      try {
        setIsLoading(true);
        // In a real app, you would make an API call to get the idea details
        // For now, we'll simulate it with a timeout
        // Replace this with your actual API call
        
        // Example:
        // const response = await ideaService.getIdea(ideaId);
        // setIdea(response);
        
        // Simulated data for example purposes
        setTimeout(() => {
          const mockIdea = {
            $id: ideaId,
            userId: "user123",
            title: "AI-Powered Meal Planning App",
            description: "An application that uses AI to create personalized meal plans based on dietary restrictions, preferences, and nutritional goals. The app would also generate shopping lists and provide cooking instructions.",
            isPublic: true,
            createdAt: new Date().toISOString(),
            analysisResults: {
              summary: {
                overview: "This AI meal planning app has strong market potential with the growing health-conscious consumer base and increasing demand for personalized nutrition solutions.",
                strengths: ["Personalization capabilities", "Convenience factor", "Health-focused approach", "Time-saving value proposition"],
                challenges: ["Crowded market space", "Algorithm accuracy", "User retention"],
                recommendedFocus: "Focus on nutritional accuracy and meal variety to differentiate from competitors."
              },
              marketAnalysis: {
                marketSize: "$10.8B in 2023",
                projectedGrowth: "14.5% CAGR through 2030",
                targetAudience: ["Health-conscious professionals", "Fitness enthusiasts", "People with dietary restrictions", "Busy families"],
                trends: ["Increasing focus on personalized nutrition", "Integration with grocery delivery services", "Sustainability and waste reduction"]
              },
              competition: {
                directCompetitors: [
                  { name: "Mealime", strengths: "User-friendly interface", weaknesses: "Limited personalization" },
                  { name: "Eat This Much", strengths: "Strong algorithm", weaknesses: "Subscription pricing barriers" },
                  { name: "PlateJoy", strengths: "Personalization options", weaknesses: "Higher price point" }
                ],
                differentiationStrategy: "Focus on the AI nutritional optimization algorithm and seamless grocery integration."
              },
              feasibilityAnalysis: {
                technicalComplexity: "Medium-High",
                developmentTimeframe: "6-9 months",
                keyTechnologies: ["Machine learning algorithms", "Nutritional databases", "Mobile app development", "Cloud infrastructure"],
                resourceRequirements: "3-5 developers, 1 nutritionist/domain expert, 1 UI/UX designer"
              }
            }
          };
          
          setIdea(mockIdea);
          setIsLoading(false);
        }, 1500);
        
      } catch (err: any) {
        console.error('Failed to fetch idea:', err);
        setError('Failed to load idea details. Please try again.');
        setIsLoading(false);
      }
    };

    fetchIdea();
  }, [ideaId, navigate]);

  const toggleVisibility = async () => {
    if (!idea) return;
    
    try {
      await ideaService.updateIdeaVisibility(idea.$id, !idea.isPublic);
      setIdea({ ...idea, isPublic: !idea.isPublic });
    } catch (err: any) {
      console.error('Failed to update visibility:', err);
      setError('Failed to update visibility. Please try again.');
    }
  };

  const downloadAnalysis = () => {
    if (!idea) return;
    
    const analysisBlob = new Blob(
      [JSON.stringify(idea.analysisResults, null, 2)], 
      { type: 'application/json' }
    );
    
    const url = URL.createObjectURL(analysisBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title.replace(/\s+/g, '-').toLowerCase()}-analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const isOwner = user && idea && user.$id === idea.userId;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3">
              <AlertCircle size={24} className="text-red-400" />
              <div>
                <h3 className="text-xl font-semibold mb-1">Error</h3>
                <p className="text-gray-300">{error}</p>
              </div>
            </div>
          ) : idea ? (
            <div>
              {/* Idea header */}
              <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                  <h1 className="text-3xl font-bold">{idea.title}</h1>
                  
                  <div className="flex gap-3">
                    {isOwner && (
                      <button
                        onClick={toggleVisibility}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg ${
                          idea.isPublic 
                            ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                        } transition-colors`}
                      >
                        {idea.isPublic ? (
                          <>
                            <Eye size={16} />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={16} />
                            <span>Private</span>
                          </>
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={downloadAnalysis}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 transition-colors"
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </button>
                    
                    {idea.isPublic && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          // Show a toast notification here
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                      >
                        <Share size={16} />
                        <span>Share</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={15} />
                    <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <User size={15} />
                    <span>{isOwner ? 'You' : 'Anonymous User'}</span>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-gray-300">{idea.description}</p>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="mb-6 border-b border-gray-800">
                <nav className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'summary'
                        ? 'border-b-2 border-primary-500 text-primary-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('market')}
                    className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'market'
                        ? 'border-b-2 border-primary-500 text-primary-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Market Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab('competition')}
                    className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'competition'
                        ? 'border-b-2 border-primary-500 text-primary-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Competition
                  </button>
                  <button
                    onClick={() => setActiveTab('feasibility')}
                    className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'feasibility'
                        ? 'border-b-2 border-primary-500 text-primary-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Feasibility
                  </button>
                </nav>
              </div>
              
              {/* Tab content */}
              <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6">
                {activeTab === 'summary' && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Summary</h2>
                    <p className="text-gray-300 mb-6">{idea.analysisResults.summary.overview}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-medium mb-3 text-green-400">Strengths</h3>
                        <ul className="space-y-2">
                          {idea.analysisResults.summary.strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-medium mb-3 text-amber-400">Challenges</h3>
                        <ul className="space-y-2">
                          {idea.analysisResults.summary.challenges.map((challenge: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-amber-500 mt-1">•</span>
                              <span>{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-primary-900/30 p-4 rounded-lg border border-primary-800/50">
                      <h3 className="text-lg font-medium mb-2 text-primary-400">Recommended Focus</h3>
                      <p className="text-gray-300">{idea.analysisResults.summary.recommendedFocus}</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'market' && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Market Analysis</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-medium mb-1">Market Size</h3>
                        <p className="text-2xl font-bold text-primary-400">{idea.analysisResults.marketAnalysis.marketSize}</p>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-medium mb-1">Projected Growth</h3>
                        <p className="text-2xl font-bold text-green-400">{idea.analysisResults.marketAnalysis.projectedGrowth}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 mb-6">
                      <h3 className="text-lg font-medium mb-3">Target Audience</h3>
                      <div className="flex flex-wrap gap-2">
                        {idea.analysisResults.marketAnalysis.targetAudience.map((audience: string, index: number) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm"
                          >
                            {audience}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700">
                      <h3 className="text-lg font-medium mb-3">Key Market Trends</h3>
                      <ul className="space-y-3">
                        {idea.analysisResults.marketAnalysis.trends.map((trend: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="bg-blue-500 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-gray-300">{trend}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {activeTab === 'competition' && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Competitive Analysis</h2>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">Key Competitors</h3>
                      <div className="space-y-4">
                        {idea.analysisResults.competition.directCompetitors.map((competitor: any, index: number) => (
                          <div 
                            key={index}
                            className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row gap-4"
                          >
                            <div className="md:w-1/3">
                              <h4 className="font-semibold text-lg mb-1">{competitor.name}</h4>
                            </div>
                            <div className="md:w-1/3">
                              <h5 className="text-sm text-gray-400 mb-1">Strengths</h5>
                              <p className="text-gray-300">{competitor.strengths}</p>
                            </div>
                            <div className="md:w-1/3">
                              <h5 className="text-sm text-gray-400 mb-1">Weaknesses</h5>
                              <p className="text-gray-300">{competitor.weaknesses}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-primary-900/30 p-5 rounded-lg border border-primary-800/50">
                      <h3 className="text-lg font-medium mb-2 text-primary-400">Differentiation Strategy</h3>
                      <p className="text-gray-300">{idea.analysisResults.competition.differentiationStrategy}</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'feasibility' && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Feasibility Analysis</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-medium mb-1">Technical Complexity</h3>
                        <p className="text-2xl font-bold text-amber-400">{idea.analysisResults.feasibilityAnalysis.technicalComplexity}</p>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-medium mb-1">Development Timeframe</h3>
                        <p className="text-2xl font-bold text-primary-400">{idea.analysisResults.feasibilityAnalysis.developmentTimeframe}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 mb-6">
                      <h3 className="text-lg font-medium mb-3">Key Technologies</h3>
                      <div className="flex flex-wrap gap-2">
                        {idea.analysisResults.feasibilityAnalysis.keyTechnologies.map((tech: string, index: number) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-primary-900/50 border border-primary-800/50 text-primary-300 rounded-full text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700">
                      <h3 className="text-lg font-medium mb-2">Resource Requirements</h3>
                      <p className="text-gray-300">{idea.analysisResults.feasibilityAnalysis.resourceRequirements}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">Idea not found</h2>
              <p className="text-gray-400 mb-6">The idea you're looking for might have been deleted or is not accessible.</p>
              <button
                onClick={() => navigate('/my-ideas')}
                className="btn-primary px-5 py-2.5 rounded-lg"
              >
                View My Ideas
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default IdeaDetailsPage;
