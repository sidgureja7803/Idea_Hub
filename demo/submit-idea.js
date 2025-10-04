import axios from 'axios';

// Wait for services to be ready
const waitForBackend = async () => {
  const maxRetries = 30;
  const retryInterval = 2000;
  let retries = 0;

  console.log('Waiting for backend to be ready...');

  while (retries < maxRetries) {
    try {
      await axios.get('http://backend:8000/health');
      console.log('Backend is ready!');
      return true;
    } catch (error) {
      retries++;
      console.log(`Backend not ready yet, retrying (${retries}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }

  throw new Error('Backend service not available after maximum retries');
};

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import sample idea from JSON file
const sampleIdeaPath = path.join(__dirname, 'sampleIdea.json');
const sampleIdea = JSON.parse(fs.readFileSync(sampleIdeaPath, 'utf8'));

// Submit the sample idea
const submitSampleIdea = async () => {
  try {
    console.log('Submitting sample idea...');

    // Submit the idea to the backend API
    const response = await axios.post('http://backend:8000/api/ideas', sampleIdea);
    
    console.log('Sample idea submitted successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    console.log('Demo submission complete. You can now visit the frontend at http://localhost:3000');
    
    // Poll the job status (optional)
    if (response.data && response.data.jobId) {
      await pollJobStatus(response.data.jobId);
    }
    
  } catch (error) {
    console.error('Error submitting sample idea:', error.message);
    process.exit(1);
  }
};

// Poll job status
const pollJobStatus = async (jobId) => {
  const maxRetries = 30;
  const retryInterval = 2000;
  let retries = 0;

  console.log(`Polling job status for job ${jobId}...`);

  while (retries < maxRetries) {
    try {
      const response = await axios.get(`http://backend:8000/api/jobs/${jobId}`);
      console.log(`Job status: ${response.data.status}, Progress: ${response.data.progress}%`);
      
      if (response.data.status === 'completed' || response.data.status === 'failed') {
        console.log('Job processing finished!');
        return;
      }
      
      retries++;
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    } catch (error) {
      retries++;
      console.log(`Error polling job status: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
  
  console.log('Finished polling job status');
};

// Main function
const main = async () => {
  try {
    // Wait for backend to be ready
    await waitForBackend();
    
    // Wait a little more to ensure the system is fully initialized
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Submit the sample idea
    await submitSampleIdea();
    
  } catch (error) {
    console.error('Error in demo script:', error.message);
    process.exit(1);
  }
};

// Run the main function
main();
