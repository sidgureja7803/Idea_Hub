import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ideaService } from '../services/appwrite';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Share2, Eye, EyeOff, Download } from 'lucide-react';
import SimpleHeader from '../components/layout/SimpleHeader';
import Footer from '../components/layout/Footer';
import AnalysisNavigation from '../components/analysis/AnalysisNavigation';
import MarketAnalysisSection from '../components/analysis/MarketAnalysisSection';
import TAMSAMSection from '../components/analysis/TAMSAMSection';
import CompetitionSection from '../components/analysis/CompetitionSection';
import FeasibilitySection from '../components/analysis/FeasibilitySection';
import StrategySection from '../components/analysis/StrategySection';

interface Idea {
  $id: string;
  userId: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  status: 'pending' | 'researching' | 'completed';
  analysisResults?: {
    marketAnalysis?: any;
    tamSam?: any;
    competition?: any;
    feasibility?: any;
    strategy?: any;
  };
}

const IdeaDetailsPage: React.FC = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('market');
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
        
        // Mock data for demonstration
        // In production, replace with: const response = await ideaService.getIdea(ideaId);
        setTimeout(() => {
          const mockIdea: Idea = {
            $id: ideaId,
            userId: user?.$id || "user123",
            title: "Smart SaaS Expense Sharing",
            description: "Aimed at freelancers and small teams, SplitPayr automates real-time expense sharing for recurring SaaS subscriptions by intelligently tracking, splitting, and managing payments, ensuring transparent, hassle-free collaboration.",
            isPublic: false,
            status: 'completed',
            createdAt: new Date().toISOString(),
            analysisResults: {
              marketAnalysis: {
                marketSize: '$3.5B',
                growthRate: '18.2% CAGR',
                customerNeed: 'High'
              },
              tamSam: {
                tam: { value: '$3.5B', percentage: 100 },
                sam: { value: '$1.1B', percentage: 30 },
                som: { value: '$0.2B', percentage: 6 }
              }
            }
          };
          
          setIdea(mockIdea);
          setIsLoading(false);
        }, 1000);
        
      } catch (err: any) {
        console.error('Failed to fetch idea:', err);
        setIsLoading(false);
      }
    };

    fetchIdea();
  }, [ideaId, navigate, user]);

  const toggleVisibility = async () => {
    if (!idea) return;
    
    try {
      await ideaService.updateIdeaVisibility(idea.$id, !idea.isPublic);
      setIdea({ ...idea, isPublic: !idea.isPublic });
    } catch (err: any) {
      console.error('Failed to toggle visibility:', err);
    }
  };

  const handleShare = () => {
    if (idea) {
      const url = `${window.location.origin}/idea/${idea.$id}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <SimpleHeader />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <SimpleHeader />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-dark-400 mb-4">Idea not found</p>
            <Link to="/my-ideas" className="text-primary-400 hover:underline">
              Back to My Ideas
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <SimpleHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/my-ideas"
          className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Ideas</span>
        </Link>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">{idea.title}</h1>
          <p className="text-dark-300 leading-relaxed mb-6">{idea.description}</p>
          
          {/* Privacy Control */}
          <div className="flex items-center gap-4 p-4 bg-dark-900/50 border border-dark-700 rounded-xl">
            <div className="flex items-center gap-2 text-sm">
              {idea.isPublic ? (
                <Eye size={16} className="text-accent-emerald" />
              ) : (
                <EyeOff size={16} className="text-dark-400" />
              )}
              <span className="text-dark-400">
                {idea.isPublic ? 'Only you can see this idea' : 'Only you can see this idea'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={toggleVisibility}
                className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors text-sm"
              >
                <Share2 size={14} />
                <span>Make Public</span>
              </button>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                title="Share"
              >
                <Download size={18} className="text-dark-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:block">
            <AnalysisNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </aside>

          {/* Analysis Content */}
          <div className="space-y-12">
            {activeSection === 'market' && (
              <MarketAnalysisSection
                marketSize={idea.analysisResults?.marketAnalysis?.marketSize || '$3.5B'}
                growthRate={idea.analysisResults?.marketAnalysis?.growthRate || '18.2% CAGR'}
                customerNeed={idea.analysisResults?.marketAnalysis?.customerNeed || 'High'}
              />
            )}

            {activeSection === 'tam-sam' && (
              <TAMSAMSection
                tam={idea.analysisResults?.tamSam?.tam || { value: '$3.5B', percentage: 100 }}
                sam={idea.analysisResults?.tamSam?.sam || { value: '$1.1B', percentage: 30 }}
                som={idea.analysisResults?.tamSam?.som || { value: '$0.2B', percentage: 6 }}
              />
            )}

            {activeSection === 'competition' && (
              <CompetitionSection />
            )}

            {activeSection === 'feasibility' && (
              <FeasibilitySection />
            )}

            {activeSection === 'strategy' && (
              <StrategySection />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IdeaDetailsPage;

