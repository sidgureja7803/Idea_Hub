import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Settings, Award } from 'lucide-react';

interface FeasibilityProps {
  opportunities?: string[];
  challenges?: string[];
  technicalFeasibility?: {
    score: number;
    rationale: string;
  };
  financialFeasibility?: {
    score: number;
    rationale: string;
  };
  marketFeasibility?: {
    score: number;
    rationale: string;
  };
}

const FeasibilitySection: React.FC<FeasibilityProps> = ({
  opportunities = [
    'Leverage AI-driven automation to differentiate and provide intelligent payments',
    'Target growing segments of freelancers and remote small teams with tailored solutions',
    'Form partnerships with coworking spaces and freelance platforms to expand user base',
    'Capitalize on increasing SaaS adoption and complexity driving demand for expense management',
    'Develop premium and team management features for upselling'
  ],
  challenges = [
    'Integration complexity and costs with multiple SaaS billing platforms',
    'Building user trust and overcoming adoption barriers in financial automation',
    'Competition from established subscription and expense management platforms',
    'Navigating regulatory compliance and data privacy requirements',
    'Achieving sufficient market penetration to justify investments'
  ],
  technicalFeasibility = {
    score: 8,
    rationale: 'The technical components such as real-time tracking, intelligent splitting, integration with SaaS billing platforms are given current technologies and AI advancements. Integration complexity across multiple SaaS platforms and ensuring secure financial data handling present moderate technical challenges.'
  },
  financialFeasibility = {
    score: 7,
    rationale: 'Initial development and integration costs are moderate. Revenue potential exists through subscription and premium features, but customer acquisition costs and competitive pricing may impact profitability. Sustainable business model achievable with targeted marketing and retention strategies.'
  },
  marketFeasibility = {
    score: 8,
    rationale: 'Strong market demand driven by increasing freelancer population and SaaS subscription complexity. Target market is accessible through digital channels. Differentiation through AI and specific focus on freelancers/small teams provides competitive edge.'
  }
}) => {
  const getFeasibilityColor = (score: number) => {
    if (score >= 8) return 'text-accent-emerald';
    if (score >= 6) return 'text-accent-orange';
    return 'text-red-400';
  };

  const getFeasibilityBg = (score: number) => {
    if (score >= 8) return 'bg-accent-emerald/20';
    if (score >= 6) return 'bg-accent-orange/20';
    return 'bg-red-400/20';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Feasibility</h2>
      </div>

      {/* Opportunities and Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opportunities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-emerald/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-accent-emerald" />
            </div>
            <h3 className="text-lg font-semibold">Opportunities</h3>
          </div>
          <ul className="space-y-3">
            {opportunities.map((opportunity, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-3 text-sm text-dark-300"
              >
                <span className="text-accent-emerald mt-0.5 flex-shrink-0">•</span>
                <span>{opportunity}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Challenges */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-400/20 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold">Challenges</h3>
          </div>
          <ul className="space-y-3">
            {challenges.map((challenge, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-3 text-sm text-dark-300"
              >
                <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                <span>{challenge}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Feasibility Scores */}
      <div className="space-y-4">
        {/* Technical Feasibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-900/50 border border-dark-700 rounded-xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <Settings size={20} className="text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold">Technical Feasibility</h3>
              </div>
              <div className={`text-3xl font-bold ${getFeasibilityColor(technicalFeasibility.score)}`}>
                {technicalFeasibility.score}/10
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4 h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${technicalFeasibility.score * 10}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full ${technicalFeasibility.score >= 8 ? 'bg-accent-emerald' : technicalFeasibility.score >= 6 ? 'bg-accent-orange' : 'bg-red-400'}`}
              />
            </div>

            <p className="text-xs font-semibold text-dark-500 mb-2">Rationale</p>
            <p className="text-sm text-dark-300 leading-relaxed">{technicalFeasibility.rationale}</p>
          </div>
        </motion.div>

        {/* Financial Feasibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-900/50 border border-dark-700 rounded-xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-emerald/20 flex items-center justify-center">
                  <TrendingUp size={20} className="text-accent-emerald" />
                </div>
                <h3 className="text-lg font-semibold">Financial Feasibility</h3>
              </div>
              <div className={`text-3xl font-bold ${getFeasibilityColor(financialFeasibility.score)}`}>
                {financialFeasibility.score}/10
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4 h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${financialFeasibility.score * 10}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                className={`h-full ${financialFeasibility.score >= 8 ? 'bg-accent-emerald' : financialFeasibility.score >= 6 ? 'bg-accent-orange' : 'bg-red-400'}`}
              />
            </div>

            <p className="text-xs font-semibold text-dark-500 mb-2">Rationale</p>
            <p className="text-sm text-dark-300 leading-relaxed">{financialFeasibility.rationale}</p>
          </div>
        </motion.div>

        {/* Market Feasibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark-900/50 border border-dark-700 rounded-xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                  <Award size={20} className="text-accent-purple" />
                </div>
                <h3 className="text-lg font-semibold">Market Feasibility</h3>
              </div>
              <div className={`text-3xl font-bold ${getFeasibilityColor(marketFeasibility.score)}`}>
                {marketFeasibility.score}/10
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4 h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${marketFeasibility.score * 10}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className={`h-full ${marketFeasibility.score >= 8 ? 'bg-accent-emerald' : marketFeasibility.score >= 6 ? 'bg-accent-orange' : 'bg-red-400'}`}
              />
            </div>

            <p className="text-xs font-semibold text-dark-500 mb-2">Rationale</p>
            <p className="text-sm text-dark-300 leading-relaxed">{marketFeasibility.rationale}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeasibilitySection;

