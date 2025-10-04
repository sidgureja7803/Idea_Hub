import { z } from 'zod';

/**
 * Common schema for agent results
 */
export const AgentResultSchema = z.object({
  taskId: z.string().uuid(),
  agentId: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  input: z.any(),
  output: z.any(),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
  error: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const AgentEventSchema = z.object({
  taskId: z.string().uuid(),
  agentId: z.string(),
  step: z.string(),
  message: z.string(),
  outputRef: z.string().optional(),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
});

/**
 * Type definitions for TypeScript
 */
export const AGENT_IDS = {
  IDEA_NORMALIZER: 'idea-normalizer',
  MARKET_SEARCHER: 'market-searcher',
  MARKET_SIZER: 'market-sizer',
};

export const AGENT_STATUSES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/**
 * Export types as JSDoc for JavaScript
 * 
 * @typedef {import('zod').infer<typeof AgentResultSchema>} AgentResult
 * @typedef {import('zod').infer<typeof AgentEventSchema>} AgentEvent
 * @typedef {string} AgentId - One of the values in AGENT_IDS
 * @typedef {string} AgentStatus - One of the values in AGENT_STATUSES
 */
