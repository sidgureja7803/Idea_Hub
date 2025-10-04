/**
 * Admin Controller
 * Handles administrative operations and dashboard data
 */

import Credit from '../models/Credit.js';
import CreditPackage from '../models/CreditPackage.js';

/**
 * Admin dashboard controller
 */
const adminController = {
  /**
   * Get dashboard overview statistics
   */
  getDashboardStats: async (req, res) => {
    try {
      // Get credit usage stats
      const creditsUsed = await Credit.aggregate([
        { $unwind: '$transactions' },
        { $match: { 'transactions.type': 'usage' } },
        { $group: { _id: null, total: { $sum: { $abs: '$transactions.amount' } } } }
      ]);
      
      const totalCreditsUsed = creditsUsed.length > 0 ? creditsUsed[0].total : 0;
      
      // Get credit purchase stats
      const creditsPurchased = await Credit.aggregate([
        { $unwind: '$transactions' },
        { $match: { 'transactions.type': 'purchase' } },
        { $group: { _id: null, total: { $sum: '$transactions.amount' } } }
      ]);
      
      const totalCreditsPurchased = creditsPurchased.length > 0 ? creditsPurchased[0].total : 0;
      
      // Get user count
      const userCount = await Credit.countDocuments();
      
      // Get package counts
      const packageCount = await CreditPackage.countDocuments();
      
      // Get recent transactions
      const recentTransactions = await Credit.aggregate([
        { $unwind: '$transactions' },
        { $sort: { 'transactions.createdAt': -1 } },
        { $limit: 10 },
        { 
          $project: { 
            userId: 1,
            amount: '$transactions.amount',
            type: '$transactions.type',
            description: '$transactions.description',
            createdAt: '$transactions.createdAt'
          } 
        }
      ]);
      
      return res.status(200).json({
        stats: {
          totalUsers: userCount,
          totalPackages: packageCount,
          totalCreditsUsed,
          totalCreditsPurchased,
          currentBalance: totalCreditsPurchased - totalCreditsUsed,
          conversionRate: userCount > 0 ? (totalCreditsPurchased / userCount).toFixed(2) : 0
        },
        recentTransactions
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return res.status(500).json({
        error: 'Failed to retrieve dashboard statistics',
        message: error.message
      });
    }
  },
  
  /**
   * Get credit usage analytics
   */
  getCreditAnalytics: async (req, res) => {
    try {
      // Get daily credit usage over time
      const dailyUsage = await Credit.aggregate([
        { $unwind: '$transactions' },
        { $match: { 'transactions.type': 'usage' } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$transactions.createdAt' }
            },
            amount: { $sum: { $abs: '$transactions.amount' } }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: '$_id',
            amount: 1,
            _id: 0
          }
        }
      ]);
      
      // Get usage by feature/purpose
      const usageByPurpose = await Credit.aggregate([
        { $unwind: '$transactions' },
        { $match: { 'transactions.type': 'usage' } },
        {
          $group: {
            _id: '$transactions.description',
            amount: { $sum: { $abs: '$transactions.amount' } }
          }
        },
        { $sort: { amount: -1 } },
        {
          $project: {
            purpose: '$_id',
            amount: 1,
            _id: 0
          }
        }
      ]);
      
      // Get purchase analytics by package
      const purchasesByPackage = await Credit.aggregate([
        { $unwind: '$transactions' },
        { $match: { 'transactions.type': 'purchase' } },
        {
          $group: {
            _id: '$transactions.packageId',
            count: { $sum: 1 },
            totalAmount: { $sum: '$transactions.amount' }
          }
        },
        {
          $lookup: {
            from: 'creditpackages',
            localField: '_id',
            foreignField: '_id',
            as: 'packageInfo'
          }
        },
        { $unwind: { path: '$packageInfo', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            packageId: '$_id',
            packageName: { $ifNull: ['$packageInfo.name', 'Unknown Package'] },
            count: 1,
            totalAmount: 1,
            _id: 0
          }
        },
        { $sort: { totalAmount: -1 } }
      ]);
      
      return res.status(200).json({
        dailyUsage,
        usageByPurpose,
        purchasesByPackage
      });
    } catch (error) {
      console.error('Error getting credit analytics:', error);
      return res.status(500).json({
        error: 'Failed to retrieve credit analytics',
        message: error.message
      });
    }
  },
  
  /**
   * Manage credit packages (CRUD operations)
   */
  createCreditPackage: async (req, res) => {
    try {
      const {
        name,
        description,
        credits,
        price,
        currency,
        features,
        popular,
        sortOrder
      } = req.body;
      
      // Validate required fields
      if (!name || !description || !credits || price === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create new package
      const newPackage = new CreditPackage({
        name,
        description,
        credits,
        price,
        currency: currency || 'USD',
        features: features || [],
        popular: popular || false,
        sortOrder: sortOrder || 0,
        isActive: true
      });
      
      await newPackage.save();
      
      return res.status(201).json(newPackage);
    } catch (error) {
      console.error('Error creating credit package:', error);
      return res.status(500).json({
        error: 'Failed to create credit package',
        message: error.message
      });
    }
  },
  
  updateCreditPackage: async (req, res) => {
    try {
      const { packageId } = req.params;
      const updateData = req.body;
      
      if (!packageId) {
        return res.status(400).json({ error: 'Package ID is required' });
      }
      
      // Find and update the package
      const updatedPackage = await CreditPackage.findByIdAndUpdate(
        packageId,
        { ...updateData, updatedAt: Date.now() },
        { new: true }
      );
      
      if (!updatedPackage) {
        return res.status(404).json({ error: 'Credit package not found' });
      }
      
      return res.status(200).json(updatedPackage);
    } catch (error) {
      console.error('Error updating credit package:', error);
      return res.status(500).json({
        error: 'Failed to update credit package',
        message: error.message
      });
    }
  },
  
  deleteCreditPackage: async (req, res) => {
    try {
      const { packageId } = req.params;
      
      if (!packageId) {
        return res.status(400).json({ error: 'Package ID is required' });
      }
      
      // Find the package first
      const packageToDelete = await CreditPackage.findById(packageId);
      
      if (!packageToDelete) {
        return res.status(404).json({ error: 'Credit package not found' });
      }
      
      // Instead of actually deleting, mark as inactive
      packageToDelete.isActive = false;
      packageToDelete.updatedAt = Date.now();
      await packageToDelete.save();
      
      return res.status(200).json({
        success: true,
        message: 'Credit package deactivated successfully'
      });
    } catch (error) {
      console.error('Error deleting credit package:', error);
      return res.status(500).json({
        error: 'Failed to delete credit package',
        message: error.message
      });
    }
  },
  
  /**
   * Get user credit usage report
   */
  getUserCreditReport: async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      // Get user credit record
      const userCredit = await Credit.findOne({ userId });
      
      if (!userCredit) {
        return res.status(404).json({ error: 'User credit record not found' });
      }
      
      // Analyze transactions
      const transactions = userCredit.transactions || [];
      
      // Group transactions by type
      const purchaseTransactions = transactions.filter(t => t.type === 'purchase');
      const usageTransactions = transactions.filter(t => t.type === 'usage');
      
      // Calculate totals
      const totalPurchased = purchaseTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalUsed = usageTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return res.status(200).json({
        userId,
        balance: userCredit.balance,
        totalPurchased,
        totalUsed,
        usageByPurpose: usageTransactions.reduce((acc, t) => {
          const description = t.description || 'Other';
          acc[description] = (acc[description] || 0) + Math.abs(t.amount);
          return acc;
        }, {}),
        transactionHistory: transactions.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      });
    } catch (error) {
      console.error('Error getting user credit report:', error);
      return res.status(500).json({
        error: 'Failed to retrieve user credit report',
        message: error.message
      });
    }
  }
};

export default adminController;
