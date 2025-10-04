import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Current directory:', __dirname);
console.log('Attempting to load .env file from:', path.resolve(__dirname, '.env'));

// Try to load env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Check if environment variables are loaded
console.log('\nEnvironment variables loaded:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Found (value hidden)' : 'Not found');
console.log('TAVILY_API_KEY:', process.env.TAVILY_API_KEY ? 'Found (value hidden)' : 'Not found');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found (value hidden)' : 'Not found');

// List all environment variables with API or KEY in their name
const apiKeys = Object.keys(process.env).filter(key => 
  key.includes('API') || key.includes('KEY')
);

console.log('\nAll API keys and keys found:');
apiKeys.forEach(key => {
  console.log(`- ${key}: ${process.env[key] ? 'Found (value hidden)' : 'Not found'}`);
});

console.log('\nTest complete.');
