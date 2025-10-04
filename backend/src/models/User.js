/**
 * User Model
 * Manages user search history, limits, and preferences
 */

import mongoose from 'mongoose';

// Define the search history schema
const searchHistorySchema = new mongoose.Schema({
  ideaId: {
    type: String,
    required: true,
    description: 'Unique identifier for the idea analysis'
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    description: 'Reference to the job record'
  },
  title: {
    type: String,
    required: true,
    description: 'User-friendly title for the search'
  },
  description: {
    type: String,
    required: true,
    description: 'Original idea description'
  },
  category: {
    type: String,
    required: true,
    description: 'Business category'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Analysis results when completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    description: 'When the analysis was completed'
  }
});

// Define the user schema
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    description: 'Clerk user ID'
  },
  email: {
    type: String,
    required: true,
    description: 'User email from Clerk'
  },
  firstName: {
    type: String,
    description: 'User first name'
  },
  lastName: {
    type: String,
    description: 'User last name'
  },
  imageUrl: {
    type: String,
    description: 'User profile image URL'
  },
  tier: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free',
    description: 'User subscription tier'
  },
  searchHistory: [searchHistorySchema],
  searchLimits: {
    free: {
      maxSearches: {
        type: Number,
        default: 5,
        description: 'Maximum searches allowed for free tier'
      },
      searchesUsed: {
        type: Number,
        default: 0,
        min: 0,
        description: 'Number of searches used in current period'
      },
      periodStart: {
        type: Date,
        default: Date.now,
        description: 'Start of current usage period'
      },
      periodEnd: {
        type: Date,
        default: function() {
          // Set to 30 days from now for free tier
          const end = new Date();
          end.setDate(end.getDate() + 30);
          return end;
        },
        description: 'End of current usage period'
      }
    },
    premium: {
      maxSearches: {
        type: Number,
        default: 50,
        description: 'Maximum searches allowed for premium tier'
      },
      searchesUsed: {
        type: Number,
        default: 0,
        min: 0,
        description: 'Number of searches used in current period'
      },
      periodStart: {
        type: Date,
        default: Date.now,
        description: 'Start of current usage period'
      },
      periodEnd: {
        type: Date,
        default: function() {
          // Set to 30 days from now for premium tier
          const end = new Date();
          end.setDate(end.getDate() + 30);
          return end;
        },
        description: 'End of current usage period'
      }
    },
    enterprise: {
      maxSearches: {
        type: Number,
        default: -1, // Unlimited
        description: 'Maximum searches allowed for enterprise tier'
      },
      searchesUsed: {
        type: Number,
        default: 0,
        min: 0,
        description: 'Number of searches used in current period'
      },
      periodStart: {
        type: Date,
        default: Date.now,
        description: 'Start of current usage period'
      },
      periodEnd: {
        type: Date,
        default: function() {
          // Set to 30 days from now for enterprise tier
          const end = new Date();
          end.setDate(end.getDate() + 30);
          return end;
        },
        description: 'End of current usage period'
      }
    }
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true,
      description: 'Whether user wants email notifications'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
      description: 'User interface theme preference'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient queries
userSchema.index({ userId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'searchHistory.createdAt': -1 });

// Helper methods for user management
userSchema.methods.canPerformSearch = function() {
  const currentTier = this.tier;
  const limits = this.searchLimits[currentTier];
  
  // Check if current period has expired
  const now = new Date();
  if (now > limits.periodEnd) {
    // Reset the period
    limits.searchesUsed = 0;
    limits.periodStart = now;
    limits.periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    this.updatedAt = now;
    return this.save().then(() => true);
  }
  
  // Check if user has reached their limit
  if (limits.maxSearches === -1) {
    return true; // Unlimited for enterprise
  }
  
  return limits.searchesUsed < limits.maxSearches;
};

userSchema.methods.addSearchToHistory = function(searchData) {
  const newSearch = {
    ideaId: searchData.ideaId,
    jobId: searchData.jobId,
    title: searchData.title || 'Business Idea Analysis',
    description: searchData.description,
    category: searchData.category,
    status: 'pending',
    createdAt: new Date()
  };
  
  this.searchHistory.unshift(newSearch); // Add to beginning of array
  
  // Keep only the last 50 searches to prevent unlimited growth
  if (this.searchHistory.length > 50) {
    this.searchHistory = this.searchHistory.slice(0, 50);
  }
  
  // Increment search count
  const currentTier = this.tier;
  this.searchLimits[currentTier].searchesUsed += 1;
  this.updatedAt = new Date();
  
  return this.save();
};

userSchema.methods.updateSearchStatus = function(ideaId, status, results = null) {
  const search = this.searchHistory.find(s => s.ideaId === ideaId);
  if (search) {
    search.status = status;
    if (status === 'completed') {
      search.completedAt = new Date();
      if (results) {
        search.results = results;
      }
    }
    this.updatedAt = new Date();
    return this.save();
  }
  return Promise.resolve();
};

userSchema.methods.getRecentSearches = function(limit = 10) {
  return this.searchHistory
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
};

userSchema.methods.getSearchStats = function() {
  const currentTier = this.tier;
  const limits = this.searchLimits[currentTier];
  
  return {
    tier: currentTier,
    searchesUsed: limits.searchesUsed,
    maxSearches: limits.maxSearches,
    remainingSearches: limits.maxSearches === -1 ? -1 : limits.maxSearches - limits.searchesUsed,
    periodEnd: limits.periodEnd,
    canSearch: limits.searchesUsed < limits.maxSearches || limits.maxSearches === -1
  };
};

// Update the updatedAt field on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find or create user
userSchema.statics.findOrCreateUser = async function(clerkUserData) {
  let user = await this.findOne({ userId: clerkUserData.id });
  
  if (!user) {
    user = new this({
      userId: clerkUserData.id,
      email: clerkUserData.emailAddresses[0]?.emailAddress || '',
      firstName: clerkUserData.firstName,
      lastName: clerkUserData.lastName,
      imageUrl: clerkUserData.imageUrl
    });
    await user.save();
  } else {
    // Update user info in case it changed in Clerk
    user.email = clerkUserData.emailAddresses[0]?.emailAddress || user.email;
    user.firstName = clerkUserData.firstName || user.firstName;
    user.lastName = clerkUserData.lastName || user.lastName;
    user.imageUrl = clerkUserData.imageUrl || user.imageUrl;
    await user.save();
  }
  
  return user;
};

// Create and export the model
const User = mongoose.model('User', userSchema);

export default User;
