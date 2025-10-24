import { Server } from 'socket.io';
import { AgentEventSchema } from '../agents/schema/agentSchema.js';

/**
 * Socket.io Manager for agent events
 */
class SocketManager {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize socket.io server
   * @param {object} server - HTTP server instance
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('subscribe:task', (taskId) => {
        if (typeof taskId === 'string') {
          console.log(`Client ${socket.id} subscribed to task ${taskId}`);
          socket.join(`task:${taskId}`);
        }
      });

      socket.on('unsubscribe:task', (taskId) => {
        if (typeof taskId === 'string') {
          console.log(`Client ${socket.id} unsubscribed from task ${taskId}`);
          socket.leave(`task:${taskId}`);
        }
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return this.io;
  }

  /**
   * Emit an agent event to all clients subscribed to a task
   * @param {import('../agents/schema/agentSchema.js').AgentEvent} eventData - Event data
   */
  emitAgentEvent(eventData) {
    try {
      // Validate event data
      const validatedEvent = AgentEventSchema.parse(eventData);
      
      // Emit to task room
      if (this.io) {
        this.io.to(`task:${validatedEvent.taskId}`).emit('agent:event', validatedEvent);
        console.log(`Emitted event for task ${validatedEvent.taskId}: ${validatedEvent.step}`);
      }
    } catch (error) {
      console.error('Invalid agent event data:', error);
    }
  }

  /**
   * Emit agent completion event
   * @param {string} taskId - Task ID
   * @param {string} agentId - Agent ID
   * @param {*} result - Agent result
   */
  emitAgentCompletion(taskId, agentId, result) {
    if (this.io) {
      this.io.to(`task:${taskId}`).emit('agent:complete', {
        taskId,
        agentId,
        result,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Emit orchestration completion event
   * @param {string} taskId - Task ID
   * @param {*} results - Orchestration results
   */
  emitOrchestrationComplete(taskId, results) {
    if (this.io) {
      this.io.to(`task:${taskId}`).emit('orchestration:complete', {
        taskId,
        results,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Singleton instance
export default new SocketManager();
