/**
 * Auth Routes
 * Proxy routes for Appwrite authentication
 * Note: Most auth is handled client-side with Appwrite SDK
 */

const express = require('express');
const router = express.Router();
const sdk = require('node-appwrite');
const { Client, Account, ID } = sdk;
const authMiddleware = require('../middleware/auth');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
  .setProject('foundriQ') // Replace with your project ID
  .setKey(process.env.APPWRITE_API_KEY);

// Initialize Appwrite account
const account = new Account(client);

/**
 * Get current user profile
 * (Used to verify token and get user data)
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // User data is already loaded in auth middleware
    return res.json({
      success: true,
      data: {
        id: req.userId,
        email: req.userEmail,
        name: req.userName
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
