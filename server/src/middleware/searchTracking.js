/**
 * Search Tracking Middleware
 * Handles user search limits and history tracking
 */

import User from '../models/User.js';
import { Clerk } from '@clerk/clerk-sdk-node';

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Middleware to check search limits and track searches
 * Should be used before idea submission endpoints
 */
export const checkSearchLimits = async (req, res, next) => {
  try {
    // Skip limit checking for non-authenticated users (they can't submit ideas)
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to submit ideas for analysis'
      });
    }

    // Get user from database
    const user = await User.findOne({ userId: req.auth.userId });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found. Please try signing out and back in.'
      });
    }

    // Check if user can perform a search
    const canSearch = await user.canPerformSearch();
    
    if (!canSearch) {
      const stats = user.getSearchStats();
      
      return res.status(429).json({
        error: 'Search limit exceeded',
        message: `You have reached your ${stats.tier} tier limit of ${stats.maxSearches} searches.`,
        stats: {
          tier: stats.tier,
          searchesUsed: stats.searchesUsed,
          maxSearches: stats.maxSearches,
          periodEnd: stats.periodEnd
        },
        upgradeRequired: stats.tier === 'free'
      });
    }

    // Add user info to request for use in the route handler
    req.user = user;
    req.userStats = user.getSearchStats();
    
    next();
  } catch (error) {
    console.error('Error checking search limits:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to check search limits'
    });
  }
};

/**
 * Middleware to track successful search submissions
 * Should be used after successful idea submission
 */
export const trackSearchSubmission = async (req, res, next) => {
  try {
    // Only track if user is authenticated and we have the required data
    if (!req.auth || !req.auth.userId || !req.trackedSearch) {
      return next();
    }

    const { ideaId, jobId, title, description, category } = req.trackedSearch;
    
    // Find user and add search to history
    const user = await User.findOne({ userId: req.auth.userId });
    if (user) {
      await user.addSearchToHistory({
        ideaId,
        jobId,
        title,
        description,
        category
      });
    }

    next();
  } catch (error) {
    console.error('Error tracking search submission:', error);
    // Don't fail the request if tracking fails
    next();
  }
};

/**
 * Middleware to update search status when analysis completes
 * Should be called when job status changes to completed/failed
 */
export const updateSearchStatus = async (ideaId, status, results = null) => {
  try {
    // Find all users who have this search in their history
    const users = await User.find({
      'searchHistory.ideaId': ideaId
    });

    // Update status for all users who have this search
    const updatePromises = users.map(user => 
      user.updateSearchStatus(ideaId, status, results)
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating search status:', error);
  }
};

/**
 * Middleware to get user search history
 * Returns user's recent searches
 */
export const getUserSearchHistory = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to view your search history'
      });
    }

    const user = await User.findOne({ userId: req.auth.userId });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const recentSearches = user.getRecentSearches(limit);
    const stats = user.getSearchStats();

    res.json({
      success: true,
      searches: recentSearches,
      stats: stats,
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tier: user.tier
      }
    });
  } catch (error) {
    console.error('Error getting search history:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get search history'
    });
  }
};

/**
 * Middleware to get user stats
 * Returns user's current search statistics
 */
export const getUserStats = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to view your stats'
      });
    }

    const user = await User.findOne({ userId: req.auth.userId });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    const stats = user.getSearchStats();

    res.json({
      success: true,
      stats: stats,
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tier: user.tier,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get user stats'
    });
  }
};

export default {
  checkSearchLimits,
  trackSearchSubmission,
  updateSearchStatus,
  getUserSearchHistory,
  getUserStats
};
