import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, ChevronUp, Target } from 'lucide-react';

interface Competitor {
  name: string;
  marketShare: string;
  keyDifferentiator: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
}

interface CompetitionProps {
  competitors?: Competitor[];
  ourAdvantage?: string;
}

const CompetitionSection: React.FC<CompetitionProps> = ({
  competitors = [
    {
      name: 'Zuora',
      marketShare: '25%',
      keyDifferentiator: 'Comprehensive subscription billing revenue management',
      strengths: [
        'Established market presence',
        'Enterprise-grade features',
        'Strong API integration'
      ],
      weaknesses: [
        'Complex pricing structure',
        'Steep learning curve',
        'Limited SMB focus'
      ],
      pricing: 'Starting at $299/month'
    },
    {
      name: 'Chargebee',
      marketShare: '18%',
      keyDifferentiator: 'Flexible subscription billing automation and analytics',
      strengths: [
        'User-friendly interface',
        'Good documentation',
        'Flexible pricing tiers'
      ],
      weaknesses: [
        'Limited customization',
        'Occasional sync issues',
        'Support response time'
      ],
      pricing: 'Starting at $149/month'
    },
    {
      name: 'Recurly',
      marketShare: '15%',
      keyDifferentiator: 'Subscription management with dunning intelligence',
      strengths: [
        'Strong dunning features',
        'Clean dashboard',
        'Good uptime'
      ],
      weaknesses: [
        'Limited international support',
        'Fewer integrations',
        'Basic reporting'
      ],
      pricing: 'Starting at $199/month'
    }
  ],
  ourAdvantage = 'AI-driven expense splitting specifically designed for freelancers and small teams, with intelligent payment tracking and seamless SaaS integration at a competitive price point.'
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Competition</h2>
      </div>

      {/* Market Leaders */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-primary-400" />
          <h3 className="text-xl font-semibold">Market Leaders</h3>
        </div>

        <div className="space-y-3">
          {competitors.map((competitor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-dark-900/50 border border-dark-700 rounded-xl overflow-hidden"
            >
              {/* Competitor Header */}
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full p-6 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
              >
                <div className="flex items-center gap-4 text-left flex-1">
                  <div>
                    <h4 className="text-lg font-semibold text-primary-400">{competitor.name}</h4>
                    <p className="text-sm text-dark-400 mt-1">Market share: {competitor.marketShare}</p>
                  </div>
                </div>
                {expandedIndex === index ? (
                  <ChevronUp size={20} className="text-dark-400" />
                ) : (
                  <ChevronDown size={20} className="text-dark-400" />
                )}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-dark-700"
                  >
                    <div className="p-6 space-y-4">
                      {/* Key Differentiator */}
                      <div className="flex items-start gap-2">
                        <Target size={16} className="text-primary-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-dark-500 mb-1">Key Differentiator</p>
                          <p className="text-sm text-dark-200">{competitor.keyDifferentiator}</p>
                        </div>
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="bg-dark-800/50 rounded-lg p-4">
                          <p className="text-xs font-semibold text-accent-emerald mb-3">Strengths</p>
                          <ul className="space-y-2">
                            {competitor.strengths.map((strength, i) => (
                              <li key={i} className="text-xs text-dark-300 flex items-start gap-2">
                                <span className="text-accent-emerald mt-0.5">•</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-dark-800/50 rounded-lg p-4">
                          <p className="text-xs font-semibold text-red-400 mb-3">Weaknesses</p>
                          <ul className="space-y-2">
                            {competitor.weaknesses.map((weakness, i) => (
                              <li key={i} className="text-xs text-dark-300 flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">•</span>
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between pt-2 border-t border-dark-700">
                        <span className="text-xs text-dark-400">Pricing</span>
                        <span className="text-sm font-semibold text-white">{competitor.pricing}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Our Competitive Advantage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-primary-500/10 to-accent-purple/10 border border-primary-500/30 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Target size={16} className="text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold">Our Competitive Advantage</h3>
        </div>
        <p className="text-dark-200 leading-relaxed">{ourAdvantage}</p>
      </motion.div>
    </div>
  );
};

export default CompetitionSection;

