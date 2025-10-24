import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory path and load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import worker
import './worker.js';

console.log('🤖 Worker process started');
console.log('✅ Connected to Redis queue');
console.log('✅ Connected to MongoDB');
console.log('✅ Cerebras client initialized');
console.log('✅ Ready to process idea analysis jobs');

// Keep the process running
process.on('SIGINT', () => {
  console.log('Worker shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
