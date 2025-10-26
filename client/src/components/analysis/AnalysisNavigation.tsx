import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, PieChart, Users, CheckCircle, Target, Clock } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'completed' | 'pending';
}

interface AnalysisNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  sections?: NavigationItem[];
}

const AnalysisNavigation: React.FC<AnalysisNavigationProps> = ({
  activeSection,
  onSectionChange,
  sections = [
    { id: 'market', label: 'Market Analysis', icon: <Clock size={18} />, status: 'completed' },
    { id: 'tam-sam', label: 'TAM & SAM', icon: <PieChart size={18} />, status: 'completed' },
    { id: 'competition', label: 'Competition', icon: <Users size={18} />, status: 'completed' },
    { id: 'feasibility', label: 'Feasibility', icon: <CheckCircle size={18} />, status: 'completed' },
    { id: 'strategy', label: 'Strategy', icon: <Target size={18} />, status: 'completed' }
  ]
}) => {
  return (
    <div className="sticky top-24 bg-dark-900/50 backdrop-blur-sm border border-dark-700 rounded-xl p-4">
      <div className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeSection === section.id
                ? 'bg-primary-500/20 text-white border border-primary-500/30'
                : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
            }`}
          >
            <div className={`flex-shrink-0 ${
              activeSection === section.id ? 'text-primary-400' : 'text-dark-500'
            }`}>
              {section.icon}
            </div>
            <span className="text-sm font-medium flex-1 text-left">{section.label}</span>
            {section.status === 'completed' && (
              <CheckCircle 
                size={16} 
                className={`flex-shrink-0 ${
                  activeSection === section.id ? 'text-accent-emerald' : 'text-accent-emerald/50'
                }`}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnalysisNavigation;

