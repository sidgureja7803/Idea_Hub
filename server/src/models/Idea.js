import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String
  },
  problemSolved: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error'],
    default: 'pending'
  },
  results: {
    marketResearch: {
      type: mongoose.Schema.Types.Mixed
    },
    tamSamSom: {
      type: mongoose.Schema.Types.Mixed
    },
    culturalAlignment: {
      type: mongoose.Schema.Types.Mixed
    },
    competition: {
      type: mongoose.Schema.Types.Mixed
    },
    feasibility: {
      type: mongoose.Schema.Types.Mixed
    },
    strategy: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  fullReport: {
    type: String
  },
  metadata: {
    industry: String,
    productType: String,
    keyProblem: String
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

ideaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Idea', ideaSchema);
