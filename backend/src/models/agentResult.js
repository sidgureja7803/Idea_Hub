import mongoose from 'mongoose';
import { AGENT_STATUSES } from '../agents/schema/agentSchema.js';

const agentResultSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      index: true,
    },
    agentId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AGENT_STATUSES),
      default: AGENT_STATUSES.PENDING,
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    error: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index on taskId + agentId for faster lookups
agentResultSchema.index({ taskId: 1, agentId: 1 }, { unique: true });

const AgentResult = mongoose.model('AgentResult', agentResultSchema);

export default AgentResult;
