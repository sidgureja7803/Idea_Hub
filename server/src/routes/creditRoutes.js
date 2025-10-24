/**
 * Credit Routes
 * API endpoints for credit system and PayPal integration
 */

import express from 'express';
import creditController from '../controllers/creditController.js';

const router = express.Router();

// Get user credit balance and recent transactions
router.get('/credits/user/:userId', creditController.getUserCredits);

// Get all available credit packages
router.get('/credit-packages', creditController.getCreditPackages);

// Check if user has sufficient credits
router.post('/credits/check-balance', creditController.checkCreditBalance);

// Use credits for an operation
router.post('/credits/use', creditController.useCredits);

// Create PayPal order for credit purchase
router.post('/credits/create-order', creditController.createPayPalOrder);

// Process completed PayPal payment
router.post('/credits/process-payment', creditController.processPayPalPayment);

// Get user transaction history
router.get('/credits/transactions/:userId', creditController.getTransactionHistory);

export default router;
