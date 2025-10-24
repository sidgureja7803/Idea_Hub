import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import socketManager from './utils/socketManager.js';

// Import routes
import ideaRoutesV2 from './routes/ideaRoutes.js';
import streamingRoutes from './routes/streamingRoutes.js';
import copilotRoutes from './routes/copilotRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutesV2 from './routes/authRoutes.js';
import metricsRoutes from './routes/metrics.js';
import ideaRefinerRoutes from './routes/ideaRefinerRoutes.js';
import evidenceExtractorRoutes from './routes/evidenceExtractorRoutes.js';

// Load environment variables first - with explicit path
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('Environment variables loaded from:', path.resolve(__dirname, '../.env'));

// Check for required environment variables
if (!process.env.CEREBRAS_API_KEY || !process.env.APPWRITE_API_KEY) {
  console.warn('⚠️ Warning: Missing required API keys. Set CEREBRAS_API_KEY and APPWRITE_API_KEY in your .env file.');
} else {
  console.log('✅ API Keys loaded successfully. CEREBRAS_API_KEY:', process.env.CEREBRAS_API_KEY ? 'Found (value hidden for security)' : 'Not found');
  console.log('✅ API Keys loaded successfully. APPWRITE_API_KEY:', process.env.APPWRITE_API_KEY ? 'Found (value hidden for security)' : 'Not found');
}

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize socket.io
socketManager.initialize(server);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      appwrite: process.env.APPWRITE_API_KEY ? 'configured' : 'missing key',
      cerebras: process.env.CEREBRAS_API_KEY ? 'configured' : 'missing key'
    }
  });
});

// Routes
app.use('/api/ideas', ideaRoutesV2);
app.use('/api/streaming', streamingRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutesV2);
app.use('/api/metrics', metricsRoutes);
app.use('/api/refiner', ideaRefinerRoutes);
app.use('/api/evidence', evidenceExtractorRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server (without MongoDB)
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket server initialized for real-time events`);
  console.log(`🧠 LangChain+LangGraph agents ready`);
  console.log(`📝 Using Appwrite for authentication and database`);
});

export default app;