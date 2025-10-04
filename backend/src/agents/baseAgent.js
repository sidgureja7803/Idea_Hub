import { v4 as uuidv4 } from 'uuid';
import AgentResult from '../models/agentResult.js';
import socketManager from '../utils/socketManager.js';
import { AGENT_STATUSES } from './schema/agentSchema.js';

/**
 * Base Agent class that all agents should extend
 */
export class BaseAgent {
  /**
   * Create a new agent
   * @param {string} agentId - Unique identifier for this agent
   */
  constructor(agentId) {
    this.agentId = agentId;
  }

  /**
   * Run the agent with given input
   * @param {*} task - The task input
   * @param {string} taskId - The task ID
   * @returns {Promise<*>} - The agent output
   */
  async run(task, taskId = uuidv4()) {
    // Create initial agent result record
    await this.saveAgentResult(taskId, AGENT_STATUSES.RUNNING, task);

    // Emit agent start event
    this.emitEvent(taskId, 'start', `${this.agentId} started processing`);

    try {
      // Execute agent-specific processing
      const result = await this.process(task, taskId);
      
      // Update agent result record
      await this.saveAgentResult(
        taskId, 
        AGENT_STATUSES.COMPLETED, 
        task, 
        result
      );

      // Emit completion event
      this.emitEvent(taskId, 'complete', `${this.agentId} completed processing`);
      socketManager.emitAgentCompletion(taskId, this.agentId, result);
      
      return result;
    } catch (error) {
      console.error(`Error in agent ${this.agentId}:`, error);
      
      // Update agent result record with error
      await this.saveAgentResult(
        taskId, 
        AGENT_STATUSES.FAILED, 
        task, 
        null, 
        error.message
      );

      // Emit error event
      this.emitEvent(taskId, 'error', `${this.agentId} failed: ${error.message}`);
      
      throw error;
    }
  }

  /**
   * Agent-specific processing logic (to be implemented by subclasses)
   * @param {*} task - The task input
   * @param {string} taskId - The task ID
   * @returns {Promise<*>} - The agent output
   */
  async process(task, taskId) {
    throw new Error('process() method must be implemented by subclass');
  }

  /**
   * Emit an event for this agent
   * @param {string} taskId - Task ID
   * @param {string} step - Processing step
   * @param {string} message - Event message
   * @param {string|null} outputRef - Optional reference to output data
   */
  emitEvent(taskId, step, message, outputRef = null) {
    socketManager.emitAgentEvent({
      taskId,
      agentId: this.agentId,
      step,
      message,
      outputRef,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Save or update agent result in database
   * @param {string} taskId - Task ID
   * @param {string} status - Status
   * @param {*} input - Input data
   * @param {*} output - Output data (optional)
   * @param {string|null} error - Error message (optional)
   */
  async saveAgentResult(taskId, status, input, output = null, error = null) {
    try {
      await AgentResult.findOneAndUpdate(
        { taskId, agentId: this.agentId },
        {
          taskId,
          agentId: this.agentId,
          status,
          input,
          output,
          error,
          timestamp: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (dbError) {
      console.error('Error saving agent result:', dbError);
      // Don't throw here to avoid affecting the main processing flow
    }
  }
}
