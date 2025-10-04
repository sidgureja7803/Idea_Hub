/**
 * Authentication routes for testing and verifying Clerk integration
 */

import express from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Test authentication endpoint
 * Returns user info if authenticated
 */
router.get('/me', requireAuth, (req, res) => {
  // This endpoint can only be accessed if authenticated
  // req.auth contains user information from Clerk
  res.json({
    success: true,
    message: 'Authentication successful',
    user: req.auth.user
  });
});

/**
 * Optional authentication test endpoint
 * Returns user info if authenticated, or a guest message if not
 */
router.get('/whoami', optionalAuth, (req, res) => {
  if (req.auth) {
    return res.json({
      success: true,
      authenticated: true,
      message: 'User authenticated',
      user: req.auth.user
    });
  }
  
  return res.json({
    success: true,
    authenticated: false,
    message: 'Not authenticated',
    user: null
  });
});

export default router;
