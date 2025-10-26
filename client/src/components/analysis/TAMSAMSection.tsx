import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Target, TrendingUp } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TAMSAMProps {
  tam: { value: string; percentage: number };
  sam: { value: string; percentage: number };
  som: { value: string; percentage: number };
  segments?: Array<{ name: string; description: string; value: string }>;
}

const TAMSAMSection: React.FC<TAMSAMProps> = ({
  tam,
  sam,
  som,
  segments = [
    { name: 'Enterprise', description: 'Large organizations with 1000+ employees', value: '45%' },
    { name: 'SMB', description: 'Small to medium businesses with 50-1000 employees', value: '35%' },
    { name: 'Startups', description: 'Early-stage companies under 50 employees', value: '20%' }
  ]
}) => {
  const chartData = {
    labels: ['TAM', 'SAM', 'SOM'],
    datasets: [
      {
        data: [tam.percentage, sam.percentage, som.percentage],
        backgroundColor: [
          'rgba(14, 165, 233, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: [
          'rgb(14, 165, 233)',
          'rgb(139, 92, 246)',
          'rgb(16, 185, 129)'
        ],
        borderWidth: 2,
        cutout: '70%'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(14, 165, 233, 0.5)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">TAM & SAM</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Size Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChart size={20} className="text-primary-400" />
            <h3 className="text-xl font-semibold">Market Size Distribution</h3>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-64 h-64">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-dark-400 mb-2">Market Breakdown</p>
          </div>
        </motion.div>

        {/* Market Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* TAM */}
          <div className="bg-dark-900/50 border border-dark-700 rounded-xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                  <h4 className="font-semibold text-lg">TAM</h4>
                </div>
                <p className="text-xs text-dark-400">Total Addressable Market</p>
              </div>
              <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded">
                {tam.percentage}%
              </span>
            </div>
            <p className="text-2xl font-bold text-primary-400">{tam.value}</p>
          </div>

          {/* SAM */}
          <div className="bg-dark-900/50 border border-dark-700 rounded-xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-accent-purple"></div>
                  <h4 className="font-semibold text-lg">SAM</h4>
                </div>
                <p className="text-xs text-dark-400">Serviceable Addressable Market</p>
              </div>
              <span className="text-xs bg-accent-purple/20 text-accent-purple px-2 py-1 rounded">
                {sam.percentage}%
              </span>
            </div>
            <p className="text-2xl font-bold text-accent-purple">{sam.value}</p>
          </div>

          {/* SOM */}
          <div className="bg-dark-900/50 border border-dark-700 rounded-xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-accent-emerald"></div>
                  <h4 className="font-semibold text-lg">SOM</h4>
                </div>
                <p className="text-xs text-dark-400">Serviceable Obtainable Market</p>
              </div>
              <span className="text-xs bg-accent-emerald/20 text-accent-emerald px-2 py-1 rounded">
                {som.percentage}%
              </span>
            </div>
            <p className="text-2xl font-bold text-accent-emerald">{som.value}</p>
          </div>
        </motion.div>
      </div>

      {/* Market Segments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Target size={20} className="text-primary-400" />
          <h3 className="text-xl font-semibold">Market Segments</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {segments.map((segment, index) => (
            <div key={index} className="bg-dark-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{segment.name}</h4>
                <span className="text-sm font-bold text-primary-400">{segment.value}</span>
              </div>
              <p className="text-xs text-dark-400">{segment.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TAMSAMSection;

