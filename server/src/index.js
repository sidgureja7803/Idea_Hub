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
import researchRoutes from './routes/researchRoutes.js';

// Load environment variables first - with explicit path
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('Environment variables loaded from:', path.resolve(__dirname, '../.env'));

// Check for required environment variables
const requiredVars = [
  'CEREBRAS_API_KEY',
  'PERPLEXITY_API_KEY',
  'APPWRITE_API_KEY',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_ENDPOINT',
  'APPWRITE_DATABASE_ID'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please add them to your .env file');
} else {
  console.log('✅ All required environment variables are present');
}

// Log optional variables status
const optionalVars = ['APPWRITE_REPORTS_BUCKET_ID', 'APPWRITE_DOCUMENTS_BUCKET_ID', 'TAVILY_API_KEY'];
optionalVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`⚠️ Optional variable ${varName} is not set`);
  }
});

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
  const requiredServices = {
    appwrite: process.env.APPWRITE_API_KEY && process.env.APPWRITE_PROJECT_ID && process.env.APPWRITE_DATABASE_ID,
    cerebras: process.env.CEREBRAS_API_KEY
  };
  
  const missingServices = Object.entries(requiredServices)
    .filter(([_, isConfigured]) => !isConfigured)
    .map(([name]) => name);
  
  const status = missingServices.length === 0 ? 'OK' : 'DEGRADED';
  
  res.json({ 
    status, 
    timestamp: new Date().toISOString(),
    services: {
      appwrite: requiredServices.appwrite ? 'configured' : 'missing configuration',
      cerebras: requiredServices.cerebras ? 'configured' : 'missing key',
      storage: process.env.APPWRITE_REPORTS_BUCKET_ID ? 'configured' : 'not configured'
    },
    missingServices: missingServices.length > 0 ? missingServices : undefined
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
app.use('/api/research', researchRoutes);
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

// Only start server if all required variables are present
if (missingVars.length === 0) {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 WebSocket server initialized for real-time events`);
    console.log(`🧠 LangChain+LangGraph agents ready with Cerebras integration`);
    console.log(`📝 Using Appwrite for authentication and database (${process.env.APPWRITE_DATABASE_ID})`);
  });
} else {
  console.error('Server not started due to missing environment variables');
  process.exit(1);
}

export default app;