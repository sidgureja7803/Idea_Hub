/**
 * UserDashboardPage Component
 * User dashboard showing search history, stats, and account management
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../utils/api';
import SearchHistory from '../components/user/SearchHistory';
import { UserStats } from '../hooks/useAuth';

const UserDashboardPage: React.FC = () => {
  const { user, userStats, isAuthenticated, isLoading, refreshStats } = useAuth();
  const api = useApi();
  const [activeTab, setActiveTab] = useState<'history' | 'stats' | 'settings'>('history');
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async (tier: 'premium' | 'enterprise') => {
    try {
      setUpgrading(true);
      const response = await api.post('/user/upgrade', { tier });
      if (response.success) {
        await refreshStats();
        alert(`Successfully upgraded to ${tier} tier!`);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to upgrade. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please Sign In
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be signed in to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your business idea analyses and account settings.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'history', label: 'Search History', icon: '📊' },
              { id: 'stats', label: 'Usage Statistics', icon: '📈' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'history' && (
              <SearchHistory limit={20} showStats={false} />
            )}
            
            {activeTab === 'stats' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Usage Statistics
                </h3>
                
                {userStats && (
                  <div className="space-y-6">
                    {/* Current Tier */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Current Plan
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {userStats.tier.charAt(0).toUpperCase() + userStats.tier.slice(1)}
                        </span>
                        {userStats.tier === 'free' && (
                          <button
                            onClick={() => handleUpgrade('premium')}
                            disabled={upgrading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            {upgrading ? 'Upgrading...' : 'Upgrade'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {userStats.searchesUsed}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          Searches Used
                        </div>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {userStats.remainingSearches === -1 ? '∞' : userStats.remainingSearches}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Remaining
                        </div>
                      </div>
                    </div>

                    {/* Usage Progress */}
                    {userStats.maxSearches !== -1 && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>Usage Progress</span>
                          <span>{userStats.searchesUsed} / {userStats.maxSearches}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((userStats.searchesUsed / userStats.maxSearches) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Period Info */}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>
                        Usage period ends: {new Date(userStats.periodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Account Settings
                </h3>
                
                <div className="space-y-6">
                  {/* Profile Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Profile Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Name:</span>
                        <span className="text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Email:</span>
                        <span className="text-gray-900 dark:text-white">{user?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Tier:</span>
                        <span className="text-gray-900 dark:text-white">
                          {user?.tier?.charAt(0).toUpperCase() + user?.tier?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Preferences
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Theme:</span>
                        <span className="text-gray-900 dark:text-white">
                          {user?.preferences?.theme || 'Auto'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Notifications:</span>
                        <span className="text-gray-900 dark:text-white">
                          {user?.preferences?.notifications ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            {userStats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Stats
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Tier</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {userStats.tier.charAt(0).toUpperCase() + userStats.tier.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Searches Used</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {userStats.searchesUsed}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {userStats.remainingSearches === -1 ? '∞' : userStats.remainingSearches}
                    </span>
                  </div>
                  
                  {!userStats.canSearch && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        Search limit reached
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/submit-idea'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Submit New Idea
                </button>
                
                {user?.tier === 'free' && (
                  <button
                    onClick={() => handleUpgrade('premium')}
                    disabled={upgrading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {upgrading ? 'Upgrading...' : 'Upgrade to Premium'}
                  </button>
                )}
                
                <button
                  onClick={() => window.location.href = '/help'}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Help & Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
