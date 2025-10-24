/**
 * User Routes
 * Handles user profile, search history, and statistics
 */

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getUserSearchHistory, getUserStats } from '../middleware/searchTracking.js';
import User from '../models/User.js';
import { Clerk } from '@clerk/clerk-sdk-node';

const router = express.Router();
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * @route GET /api/user/profile
 * @desc Get user profile information
 * @access Private
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
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
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        tier: user.tier,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      stats: stats
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get user profile'
    });
  }
});

/**
 * @route PUT /api/user/profile
 * @desc Update user profile information
 * @access Private
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findOne({ userId: req.auth.userId });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Update preferences if provided
    if (preferences) {
      if (preferences.notifications !== undefined) {
        user.preferences.notifications = preferences.notifications;
      }
      if (preferences.theme && ['light', 'dark', 'auto'].includes(preferences.theme)) {
        user.preferences.theme = preferences.theme;
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        tier: user.tier,
        preferences: user.preferences,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update user profile'
    });
  }
});

/**
 * @route GET /api/user/stats
 * @desc Get user search statistics and limits
 * @access Private
 */
router.get('/stats', getUserStats);

/**
 * @route GET /api/user/history
 * @desc Get user search history
 * @access Private
 */
router.get('/history', getUserSearchHistory);

/**
 * @route POST /api/user/sync
 * @desc Sync user data with Clerk (create/update user profile)
 * @access Private
 */
router.post('/sync', requireAuth, async (req, res) => {
  try {
    // Get fresh user data from Clerk
    const clerkUser = await clerk.users.getUser(req.auth.userId);
    
    // Find or create user in our database
    const user = await User.findOrCreateUser(clerkUser);
    
    const stats = user.getSearchStats();

    res.json({
      success: true,
      message: 'User synced successfully',
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        tier: user.tier,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      stats: stats
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to sync user profile'
    });
  }
});

/**
 * @route POST /api/user/upgrade
 * @desc Upgrade user tier (placeholder for future implementation)
 * @access Private
 */
router.post('/upgrade', requireAuth, async (req, res) => {
  try {
    const { tier } = req.body;
    
    if (!['premium', 'enterprise'].includes(tier)) {
      return res.status(400).json({ 
        error: 'Invalid tier',
        message: 'Tier must be premium or enterprise'
      });
    }

    const user = await User.findOne({ userId: req.auth.userId });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // TODO: Implement payment processing here
    // For now, just update the tier (this should be done after successful payment)
    user.tier = tier;
    await user.save();

    const stats = user.getSearchStats();

    res.json({
      success: true,
      message: `Successfully upgraded to ${tier} tier`,
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        tier: user.tier,
        preferences: user.preferences,
        updatedAt: user.updatedAt
      },
      stats: stats
    });
  } catch (error) {
    console.error('Error upgrading user:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to upgrade user tier'
    });
  }
});

export default router;
