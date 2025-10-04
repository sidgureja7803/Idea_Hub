import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  // Job info
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    required: false
  },
  userId: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Input data
  ideaData: {
    type: Object,
    required: true
  },
  
  // Processing info
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentStage: {
    type: String,
    default: 'queued'
  },
  
  // Results
  results: {
    marketSnapshot: Object,
    tam: Object,
    competition: Object,
    feasibility: Object,
    aggregated: Object,
    error: Object
  },
  
  // Performance metrics
  metrics: {
    startTime: Date,
    endTime: Date,
    totalDurationMs: Number,
    agentLatencies: {
      marketSnapshot: Number,
      tam: Number,
      competition: Number,
      feasibility: Number,
      aggregator: Number
    }
  }
});

// Update the updatedAt field on save
JobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Job = mongoose.model('Job', JobSchema);

export default Job;
