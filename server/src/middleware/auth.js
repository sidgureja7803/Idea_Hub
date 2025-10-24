/**
 * Authentication middleware using Clerk
 * This middleware verifies the JWT token sent in the Authorization header
 */

import { Clerk } from '@clerk/clerk-sdk-node';
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Middleware to verify authentication
 * Adds user information to req.auth if valid
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization || '';
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    try {
      // Verify the token with Clerk
      const { sub, sessionId } = await clerk.verifyToken(token);
      
      // Get the user from Clerk
      const user = await clerk.users.getUser(sub);
      
      // Add user info to request object
      req.auth = {
        userId: sub,
        sessionId,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses[0]?.emailAddress,
          imageUrl: user.imageUrl
        }
      };
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Server error during authentication' });
  }
};

/**
 * Optional authentication middleware
 * Doesn't require authentication but adds user info if present
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization || '';
    
    if (!authHeader.startsWith('Bearer ') || !authHeader.split(' ')[1]) {
      // No token, but that's okay - continue without auth
      req.auth = null;
      return next();
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];

    try {
      // Verify the token with Clerk
      const { sub, sessionId } = await clerk.verifyToken(token);
      
      // Get the user from Clerk
      const user = await clerk.users.getUser(sub);
      
      // Add user info to request object
      req.auth = {
        userId: sub,
        sessionId,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses[0]?.emailAddress,
          imageUrl: user.imageUrl
        }
      };
    } catch (error) {
      // Token verification failed, but that's okay in optional auth
      req.auth = null;
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.auth = null;
    next();
  }
};

export default {
  requireAuth,
  optionalAuth
};
