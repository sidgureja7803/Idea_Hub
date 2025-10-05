import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Play
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const UserDashboardPage: React.FC = () => {
  const { user, userStats, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'your-ideas' | 'saved-ideas'>('your-ideas');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-800 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-800 rounded-lg"></div>
                <div className="h-32 bg-gray-800 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Please Sign In
          </h1>
          <p className="text-gray-400">
            You need to be signed in to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const stats = [
    { label: "Total Ideas", value: "1", icon: Lightbulb },
    { label: "Researched", value: "1", icon: CheckCircle },
    { label: "Pending", value: "0", icon: Clock },
    { label: "Efficiency", value: "100%", icon: TrendingUp }
  ];

  const ideas = [
    {
      id: 1,
      title: "Finance Learning Game for Youth",
      status: "completed",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Idea Gallery
          </h1>
          <p className="text-gray-400">
            Track your idea research progress and insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'your-ideas', label: 'Your Ideas' },
              { id: 'saved-ideas', label: 'Saved Ideas' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Idea Card */}
          <div className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center hover:border-gray-600 transition-colors cursor-pointer">
            <Plus className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-400 text-center">Add New Idea</p>
          </div>

          {/* Existing Ideas */}
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="relative">
                <img 
                  src={idea.image} 
                  alt={idea.title}
                  className="w-full h-48 object-cover filter blur-sm"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <h3 className="text-white text-lg font-semibold text-center px-4">
                    {idea.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrow */}
        <div className="flex justify-end mt-8">
          <button className="p-2 hover:bg-gray-900 rounded-lg transition-colors">
            <Play className="h-6 w-6 text-white rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;