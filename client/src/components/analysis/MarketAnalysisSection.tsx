import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MarketAnalysisProps {
  marketSize: string;
  growthRate: string;
  customerNeed: string;
  projections?: Array<{ year: number; value: number }>;
}

const MarketAnalysisSection: React.FC<MarketAnalysisProps> = ({
  marketSize,
  growthRate,
  customerNeed,
  projections = [
    { year: 2023, value: 2.5 },
    { year: 2024, value: 2.8 },
    { year: 2025, value: 3.3 },
    { year: 2026, value: 3.7 },
    { year: 2027, value: 3.9 }
  ]
}) => {
  const chartData = {
    labels: projections.map(p => p.year.toString()),
    datasets: [
      {
        label: 'Market Size (Billions)',
        data: projections.map(p => p.value),
        fill: true,
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: 'rgb(14, 165, 233)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
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
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y}B`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: function(value: any) {
            return `$${value}B`;
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Market Analysis</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent-emerald/20 flex items-center justify-center">
              <DollarSign size={20} className="text-accent-emerald" />
            </div>
            <span className="text-sm text-dark-400">Market Size</span>
          </div>
          <p className="text-3xl font-bold text-accent-emerald">{marketSize}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent-orange/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-accent-orange" />
            </div>
            <span className="text-sm text-dark-400">Growth Rate</span>
          </div>
          <p className="text-3xl font-bold text-accent-orange">{growthRate}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Target size={20} className="text-primary-400" />
            </div>
            <span className="text-sm text-dark-400">Customer Need</span>
          </div>
          <p className="text-3xl font-bold text-primary-400">{customerNeed}</p>
        </motion.div>
      </div>

      {/* Market Size Over Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-dark-900/50 border border-dark-700 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-primary-400" />
          <h3 className="text-xl font-semibold">Market Size Over Time</h3>
        </div>
        <div className="h-[300px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </motion.div>
    </div>
  );
};

export default MarketAnalysisSection;

