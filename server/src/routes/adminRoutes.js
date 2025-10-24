/**
 * Admin Routes
 * API endpoints for admin dashboard and management
 */

import express from 'express';
import adminController from '../controllers/adminController.js';

const router = express.Router();

// Dashboard statistics
router.get('/admin/dashboard', adminController.getDashboardStats);

// Credit analytics
router.get('/admin/analytics/credits', adminController.getCreditAnalytics);

// Credit package management
router.post('/admin/credit-packages', adminController.createCreditPackage);
router.put('/admin/credit-packages/:packageId', adminController.updateCreditPackage);
router.delete('/admin/credit-packages/:packageId', adminController.deleteCreditPackage);

// User credit reports
router.get('/admin/users/:userId/credits', adminController.getUserCreditReport);

export default router;
