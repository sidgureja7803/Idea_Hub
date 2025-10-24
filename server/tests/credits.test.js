/**
 * Credit System Tests
 * Tests credit model functionality, API routes, and transaction handling
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import Credit from '../src/models/Credit.js';
import CreditPackage from '../src/models/CreditPackage.js';
import creditRoutes from '../src/routes/creditRoutes.js';

// Setup test app
const app = express();
app.use(express.json());
app.use('/api', creditRoutes);

// Setup in-memory MongoDB
let mongoServer;

beforeAll(async () => {
  // Start MongoDB memory server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create test credit packages
  await CreditPackage.create({
    name: 'Basic Package',
    description: 'Entry-level credit package',
    credits: 100,
    price: 9.99,
    currency: 'USD',
    features: ['Basic Analysis', 'Market Research'],
    popular: false,
    isActive: true
  });

  await CreditPackage.create({
    name: 'Pro Package',
    description: 'Professional credit package with more features',
    credits: 500,
    price: 39.99,
    currency: 'USD',
    features: ['Advanced Analysis', 'Market Research', 'Strategic Recommendations', 'Export Reports'],
    popular: true,
    isActive: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Credit Model', () => {
  let userId;
  
  beforeEach(async () => {
    // Clean up before each test
    await Credit.deleteMany({});
    userId = new mongoose.Types.ObjectId().toString();
  });
  
  test('should create a new credit record with zero balance', async () => {
    const credit = new Credit({ userId });
    await credit.save();
    
    const savedCredit = await Credit.findOne({ userId });
    expect(savedCredit).toBeTruthy();
    expect(savedCredit.balance).toBe(0);
    expect(savedCredit.transactions).toHaveLength(0);
  });
  
  test('should add credits correctly', async () => {
    const credit = new Credit({ userId });
    await credit.save();
    
    await credit.addCredits(100, 'purchase', 'Purchased basic package');
    
    const updatedCredit = await Credit.findOne({ userId });
    expect(updatedCredit.balance).toBe(100);
    expect(updatedCredit.transactions).toHaveLength(1);
    expect(updatedCredit.transactions[0].type).toBe('purchase');
    expect(updatedCredit.transactions[0].amount).toBe(100);
  });
  
  test('should use credits correctly', async () => {
    const credit = new Credit({ userId, balance: 100 });
    await credit.save();
    
    await credit.useCredits(30, 'Used for analysis');
    
    const updatedCredit = await Credit.findOne({ userId });
    expect(updatedCredit.balance).toBe(70);
    expect(updatedCredit.transactions).toHaveLength(1);
    expect(updatedCredit.transactions[0].type).toBe('usage');
    expect(updatedCredit.transactions[0].amount).toBe(-30);
  });
  
  test('should throw error when trying to use more credits than available', async () => {
    const credit = new Credit({ userId, balance: 10 });
    await credit.save();
    
    await expect(credit.useCredits(20, 'Exceeds balance')).rejects.toThrow('Insufficient credits');
    
    // Balance should remain unchanged
    const updatedCredit = await Credit.findOne({ userId });
    expect(updatedCredit.balance).toBe(10);
    expect(updatedCredit.transactions).toHaveLength(0);
  });
  
  test('should correctly return recent transactions', async () => {
    const credit = new Credit({ userId });
    await credit.save();
    
    // Add multiple transactions
    await credit.addCredits(100, 'purchase', 'First purchase');
    await credit.useCredits(30, 'First usage');
    await credit.addCredits(50, 'purchase', 'Second purchase');
    await credit.useCredits(40, 'Second usage');
    
    const recentTransactions = credit.getRecentTransactions(2);
    expect(recentTransactions).toHaveLength(2);
    // Should return most recent transactions first
    expect(recentTransactions[0].description).toBe('Second usage');
    expect(recentTransactions[1].description).toBe('Second purchase');
  });
});

describe('Credit API', () => {
  let userId;
  let packageId;
  
  beforeEach(async () => {
    // Clean up before each test
    await Credit.deleteMany({});
    userId = new mongoose.Types.ObjectId().toString();
    
    // Get a credit package ID for tests
    const creditPackage = await CreditPackage.findOne({ name: 'Basic Package' });
    packageId = creditPackage._id.toString();
  });
  
  test('should return empty credit record for new user', async () => {
    const response = await request(app)
      .get(`/api/credits/user/${userId}`);
      
    expect(response.status).toBe(200);
    expect(response.body.balance).toBe(0);
    expect(response.body.transactions).toHaveLength(0);
  });
  
  test('should get available credit packages', async () => {
    const response = await request(app)
      .get('/api/credit-packages');
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBeTruthy();
    expect(response.body[0].price).toBeTruthy();
    expect(response.body[0].credits).toBeTruthy();
  });
  
  test('should check credit balance correctly', async () => {
    // Create credit record with balance
    const credit = new Credit({ userId, balance: 50 });
    await credit.save();
    
    const response = await request(app)
      .post('/api/credits/check-balance')
      .send({ userId, requiredCredits: 30 });
      
    expect(response.status).toBe(200);
    expect(response.body.hasEnoughCredits).toBe(true);
    expect(response.body.balance).toBe(50);
    expect(response.body.deficitCredits).toBe(0);
  });
  
  test('should report insufficient credits correctly', async () => {
    // Create credit record with balance
    const credit = new Credit({ userId, balance: 20 });
    await credit.save();
    
    const response = await request(app)
      .post('/api/credits/check-balance')
      .send({ userId, requiredCredits: 30 });
      
    expect(response.status).toBe(200);
    expect(response.body.hasEnoughCredits).toBe(false);
    expect(response.body.balance).toBe(20);
    expect(response.body.deficitCredits).toBe(10);
  });
  
  test('should use credits successfully', async () => {
    // Create credit record with balance
    const credit = new Credit({ userId, balance: 100 });
    await credit.save();
    
    const response = await request(app)
      .post('/api/credits/use')
      .send({ 
        userId, 
        credits: 25, 
        description: 'Market Analysis' 
      });
      
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.remainingBalance).toBe(75);
    
    // Check database
    const updatedCredit = await Credit.findOne({ userId });
    expect(updatedCredit.balance).toBe(75);
    expect(updatedCredit.transactions).toHaveLength(1);
  });
  
  test('should reject credit usage if insufficient balance', async () => {
    // Create credit record with balance
    const credit = new Credit({ userId, balance: 10 });
    await credit.save();
    
    const response = await request(app)
      .post('/api/credits/use')
      .send({ 
        userId, 
        credits: 25, 
        description: 'Market Analysis' 
      });
      
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Insufficient credits');
    
    // Check database - should be unchanged
    const updatedCredit = await Credit.findOne({ userId });
    expect(updatedCredit.balance).toBe(10);
    expect(updatedCredit.transactions).toHaveLength(0);
  });
  
  test('should create PayPal order with package details', async () => {
    const response = await request(app)
      .post('/api/credits/create-order')
      .send({ 
        userId, 
        packageId
      });
      
    expect(response.status).toBe(200);
    expect(response.body.packageDetails).toBeTruthy();
    expect(response.body.packageDetails.credits).toBe(100);
    expect(response.body.packageDetails.price).toBe(9.99);
  });
  
  test('should process PayPal payment and add credits', async () => {
    const response = await request(app)
      .post('/api/credits/process-payment')
      .send({ 
        orderID: 'test-order-123', 
        paymentID: 'test-payment-123',
        packageId,
        userId,
        payerID: 'test-payer-123'
      });
      
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.credits).toBe(100);
    
    // Check database - credits should be added
    const updatedCredit = await Credit.findOne({ userId });
    expect(updatedCredit.balance).toBe(100);
    expect(updatedCredit.transactions).toHaveLength(1);
    expect(updatedCredit.transactions[0].type).toBe('purchase');
  });
});
