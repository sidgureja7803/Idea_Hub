/**
 * Credit Model
 * Manages user credit balances, purchases, and usage
 */

import mongoose from 'mongoose';

// Define the credit transaction schema
const creditTransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    description: 'Credit amount (positive for additions, negative for deductions)'
  },
  type: {
    type: String,
    enum: ['purchase', 'usage', 'refund', 'bonus', 'expiry'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  paymentId: {
    type: String,
    description: 'PayPal payment ID for purchases'
  },
  orderId: {
    type: String,
    description: 'PayPal order ID for purchases'
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditPackage',
    description: 'Associated credit package if applicable'
  },
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    description: 'Associated idea if used for analysis'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Define the credit schema
const creditSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [creditTransactionSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for efficient queries
creditSchema.index({ userId: 1, createdAt: -1 });

// Add helper methods for credit management
creditSchema.methods.addCredits = async function(amount, type, description, metadata = {}) {
  if (amount <= 0) {
    throw new Error('Credit amount must be positive for additions');
  }

  // Add the transaction
  this.transactions.push({
    amount,
    type,
    description,
    ...metadata
  });

  // Update balance
  this.balance += amount;
  this.updatedAt = Date.now();

  // Save the document
  return this.save();
};

creditSchema.methods.useCredits = async function(amount, description, metadata = {}) {
  if (amount <= 0) {
    throw new Error('Credit amount must be positive for deductions');
  }

  if (this.balance < amount) {
    throw new Error('Insufficient credits');
  }

  // Add the transaction
  this.transactions.push({
    amount: -amount,
    type: 'usage',
    description,
    ...metadata
  });

  // Update balance
  this.balance -= amount;
  this.updatedAt = Date.now();

  // Save the document
  return this.save();
};

creditSchema.methods.getRecentTransactions = function(limit = 10) {
  return this.transactions
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
};

// Create and export the model
const Credit = mongoose.model('Credit', creditSchema);

export default Credit;
