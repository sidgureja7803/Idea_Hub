import mongoose from 'mongoose';

const researchPackSchema = new mongoose.Schema({
  ideaId: {
    type: String,
    required: true,
    index: true
  },
  researchHash: {
    type: String,
    required: true,
    index: true
  },
  queries: [{
    type: String
  }],
  sources: [{
    url: String,
    title: String,
    domain: String,
    fetchedAt: Date
  }],
  documents: [{
    url: String,
    title: String,
    content: String,
    contentHash: String,
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
  facts: [String],
  metrics: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  assumptions: [String],
  ttl: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

researchPackSchema.index({ ideaId: 1, researchHash: 1 }, { unique: true });
researchPackSchema.index({ ttl: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('ResearchPack', researchPackSchema);
