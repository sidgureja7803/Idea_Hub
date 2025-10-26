import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, MessageSquare, Calendar, DollarSign, Zap } from 'lucide-react';

interface StrategyProps {
  primaryStrategy?: string;
  targetSegments?: string[];
  channels?: string[];
  timeline?: string;
  competitiveAdvantage?: string[];
  pricingStrategy?: {
    model: string;
    tiers: Array<{ name: string; price: string; features: string[] }>;
  };
}

const StrategySection: React.FC<StrategyProps> = ({
  primaryStrategy = 'Focus on freelancers and small teams in tech and creative industries',
  targetSegments = [
    'Freelancers with multiple SaaS subscriptions',
    'Small teams and startups sharing costs',
    'Remote workers tracking expenses across platforms'
  ],
  channels = [
    'Content marketing highlighting subscription expense tracking',
    'Partnerships with coworking spaces and freelance platforms',
    'Targeted social media campaigns on LinkedIn and Twitter',
    'Integration showcases with popular SaaS platforms'
  ],
  timeline = '6-month launch preparation, 12-month initial market entry',
  competitiveAdvantage = [
    'AI-driven intelligent expense splitting',
    'Seamless SaaS platform integrations',
    'Freelancer-focused features',
    'Competitive pricing for small teams',
    'Real-time expense tracking and insights'
  ],
  pricingStrategy = {
    model: 'Freemium with tiered subscriptions',
    tiers: [
      {
        name: 'Free',
        price: '$0/month',
        features: ['Up to 5 subscriptions', 'Basic splitting', 'Email support']
      },
      {
        name: 'Pro',
        price: '$12/month',
        features: ['Unlimited subscriptions', 'Advanced AI splitting', 'Priority support', 'Custom reports']
      },
      {
        name: 'Team',
        price: '$29/month',
        features: ['Everything in Pro', 'Team collaboration', 'Admin controls', 'API access']
      }
    ]
  }
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Strategy</h2>
      </div>

      {/* Go-to-Market Strategy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Target size={16} className="text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold">Go-to-Market Strategy</h3>
        </div>
        
        <div className="space-y-6">
          {/* Primary Strategy */}
          <div>
            <p className="text-xs font-semibold text-dark-500 mb-2">Primary Strategy</p>
            <p className="text-sm text-dark-200 leading-relaxed">{primaryStrategy}</p>
          </div>

          {/* Target Segments */}
          <div>
            <p className="text-xs font-semibold text-dark-500 mb-3">Target Segments</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {targetSegments.map((segment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-dark-800/50 rounded-lg p-3 flex items-start gap-2"
                >
                  <Users size={14} className="text-primary-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-dark-200">{segment}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Channels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent-cyan/20 flex items-center justify-center">
            <MessageSquare size={16} className="text-accent-cyan" />
          </div>
          <h3 className="text-lg font-semibold">Channels</h3>
        </div>
        
        <ul className="space-y-3">
          {channels.map((channel, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-3 text-sm text-dark-300"
            >
              <span className="text-accent-cyan mt-0.5">•</span>
              <span>{channel}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-orange/20 flex items-center justify-center">
              <Calendar size={16} className="text-accent-orange" />
            </div>
            <h3 className="text-lg font-semibold">Timeline</h3>
          </div>
          <p className="text-sm text-dark-200 leading-relaxed">{timeline}</p>
        </motion.div>

        {/* Competitive Advantage */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-emerald/20 flex items-center justify-center">
              <Zap size={16} className="text-accent-emerald" />
            </div>
            <h3 className="text-lg font-semibold">Competitive Advantage</h3>
          </div>
          <ul className="space-y-2">
            {competitiveAdvantage.map((advantage, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-dark-300">
                <span className="text-accent-emerald mt-0.5">✓</span>
                <span>{advantage}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Pricing Strategy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
            <DollarSign size={16} className="text-accent-purple" />
          </div>
          <h3 className="text-lg font-semibold">Pricing Strategy</h3>
        </div>
        
        <p className="text-sm text-dark-400 mb-6">{pricingStrategy.model}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pricingStrategy.tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`rounded-xl p-5 ${
                index === 1 
                  ? 'bg-gradient-to-br from-primary-500/20 to-accent-purple/20 border-2 border-primary-500/50' 
                  : 'bg-dark-800/50 border border-dark-700'
              }`}
            >
              <div className="mb-4">
                <h4 className="text-lg font-bold mb-1">{tier.name}</h4>
                <p className="text-2xl font-black text-primary-400">{tier.price}</p>
              </div>
              
              <ul className="space-y-2">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-dark-300">
                    <span className="text-primary-400 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StrategySection;

