/**
 * Credit Controller
 * Handles credit purchase, usage, and transaction operations
 */

import Credit from '../models/Credit.js';
import CreditPackage from '../models/CreditPackage.js';

/**
 * Credit operations controller
 */
const creditController = {
  /**
   * Get user credit balance and recent transactions
   */
  getUserCredits: async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      // Get user credit record or create if not exists
      let creditRecord = await Credit.findOne({ userId });
      
      if (!creditRecord) {
        creditRecord = new Credit({ userId, balance: 0 });
        await creditRecord.save();
      }
      
      // Get recent transactions
      const recentTransactions = creditRecord.getRecentTransactions(10);
      
      return res.status(200).json({
        balance: creditRecord.balance,
        transactions: recentTransactions,
        updatedAt: creditRecord.updatedAt
      });
    } catch (error) {
      console.error('Error getting user credits:', error);
      return res.status(500).json({
        error: 'Failed to retrieve credit information',
        message: error.message
      });
    }
  },
  
  /**
   * Get all available credit packages
   */
  getCreditPackages: async (req, res) => {
    try {
      // Get active packages sorted by sort order
      const packages = await CreditPackage.find({ isActive: true })
        .sort({ sortOrder: 1 })
        .select('-__v');
      
      return res.status(200).json(packages);
    } catch (error) {
      console.error('Error getting credit packages:', error);
      return res.status(500).json({
        error: 'Failed to retrieve credit packages',
        message: error.message
      });
    }
  },
  
  /**
   * Check if user has sufficient credits for an operation
   */
  checkCreditBalance: async (req, res) => {
    try {
      const { userId, requiredCredits } = req.body;
      
      if (!userId || requiredCredits === undefined) {
        return res.status(400).json({ error: 'User ID and required credits are required' });
      }
      
      // Get user credit record or create if not exists
      let creditRecord = await Credit.findOne({ userId });
      
      if (!creditRecord) {
        creditRecord = new Credit({ userId, balance: 0 });
        await creditRecord.save();
      }
      
      const hasEnoughCredits = creditRecord.balance >= requiredCredits;
      
      return res.status(200).json({
        hasEnoughCredits,
        balance: creditRecord.balance,
        requiredCredits,
        deficitCredits: hasEnoughCredits ? 0 : requiredCredits - creditRecord.balance
      });
    } catch (error) {
      console.error('Error checking credit balance:', error);
      return res.status(500).json({
        error: 'Failed to check credit balance',
        message: error.message
      });
    }
  },
  
  /**
   * Use credits for a specific operation
   */
  useCredits: async (req, res) => {
    try {
      const { userId, credits, description, ideaId } = req.body;
      
      if (!userId || !credits || !description) {
        return res.status(400).json({ error: 'User ID, credits, and description are required' });
      }
      
      // Get user credit record
      let creditRecord = await Credit.findOne({ userId });
      
      if (!creditRecord) {
        return res.status(404).json({ error: 'Credit record not found for user' });
      }
      
      // Verify sufficient credits
      if (creditRecord.balance < credits) {
        return res.status(400).json({ 
          error: 'Insufficient credits',
          balance: creditRecord.balance,
          required: credits
        });
      }
      
      // Use credits with metadata
      const metadata = ideaId ? { ideaId } : {};
      await creditRecord.useCredits(credits, description, metadata);
      
      return res.status(200).json({
        success: true,
        remainingBalance: creditRecord.balance,
        usedCredits: credits,
        description
      });
    } catch (error) {
      console.error('Error using credits:', error);
      return res.status(500).json({
        error: 'Failed to use credits',
        message: error.message
      });
    }
  },
  
  /**
   * Create a PayPal order for credit purchase
   */
  createPayPalOrder: async (req, res) => {
    try {
      const { packageId, userId } = req.body;
      
      if (!packageId || !userId) {
        return res.status(400).json({ error: 'Package ID and user ID are required' });
      }
      
      // Get package details
      const creditPackage = await CreditPackage.findById(packageId);
      
      if (!creditPackage || !creditPackage.isActive) {
        return res.status(404).json({ error: 'Credit package not found or inactive' });
      }
      
      // Store order intent in session or database
      // This would typically be stored in a database for production
      // For simplicity, we're just returning what PayPal needs
      
      return res.status(200).json({
        packageDetails: {
          id: creditPackage._id,
          name: creditPackage.name,
          credits: creditPackage.credits,
          price: creditPackage.price,
          currency: creditPackage.currency
        },
        userId
      });
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      return res.status(500).json({
        error: 'Failed to create order',
        message: error.message
      });
    }
  },
  
  /**
   * Process completed PayPal payment
   */
  processPayPalPayment: async (req, res) => {
    try {
      const { 
        orderID, 
        paymentID, 
        packageId, 
        userId, 
        payerID 
      } = req.body;
      
      if (!orderID || !packageId || !userId) {
        return res.status(400).json({ error: 'Order ID, package ID, and user ID are required' });
      }
      
      // Get package details
      const creditPackage = await CreditPackage.findById(packageId);
      
      if (!creditPackage || !creditPackage.isActive) {
        return res.status(404).json({ error: 'Credit package not found or inactive' });
      }
      
      // Find or create user credit record
      let creditRecord = await Credit.findOne({ userId });
      
      if (!creditRecord) {
        creditRecord = new Credit({ userId, balance: 0 });
      }
      
      // Add credits to user account
      await creditRecord.addCredits(
        creditPackage.credits,
        'purchase',
        `Purchased ${creditPackage.name} package`,
        {
          paymentId: paymentID,
          orderId: orderID,
          packageId: creditPackage._id
        }
      );
      
      return res.status(200).json({
        success: true,
        credits: creditPackage.credits,
        balance: creditRecord.balance,
        message: 'Credits added successfully'
      });
    } catch (error) {
      console.error('Error processing PayPal payment:', error);
      return res.status(500).json({
        error: 'Failed to process payment',
        message: error.message
      });
    }
  },
  
  /**
   * Get user transaction history
   */
  getTransactionHistory: async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50, skip = 0 } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      // Get credit record
      const creditRecord = await Credit.findOne({ userId });
      
      if (!creditRecord) {
        return res.status(200).json({ transactions: [] });
      }
      
      // Get transactions with pagination
      const transactions = creditRecord.transactions
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(parseInt(skip, 10), parseInt(skip, 10) + parseInt(limit, 10));
      
      return res.status(200).json({
        transactions,
        total: creditRecord.transactions.length
      });
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return res.status(500).json({
        error: 'Failed to retrieve transaction history',
        message: error.message
      });
    }
  }
};

export default creditController;
