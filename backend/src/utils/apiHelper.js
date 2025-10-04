/**
 * Utility functions for handling API calls with retry logic and error handling
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {Object} options - Options for the retry
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.initialDelayMs - Initial delay in milliseconds
 * @param {number} options.maxDelayMs - Maximum delay in milliseconds
 * @param {Function} options.onRetry - Called when a retry is attempted
 * @returns {Promise<any>} - Result of the function
 */
export async function withRetry(fn, {
  maxRetries = 3,
  initialDelayMs = 1000,
  maxDelayMs = 10000,
  onRetry = (err, attempt) => console.log(`Retry attempt ${attempt} after error: ${err.message}`)
} = {}) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // If this was the last attempt, don't retry
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        initialDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelayMs
      );
      
      onRetry(error, attempt + 1);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`Operation failed after ${maxRetries} retries: ${lastError.message}`);
}

/**
 * Create a wrapper around an LLM instance with retry logic
 * @param {Object} llm - The LLM instance
 * @param {Object} options - Retry options
 * @returns {Object} - LLM with retry logic
 */
export function createRetryingLLM(llm, options = {}) {
  const original = {
    invoke: llm.invoke.bind(llm),
    call: llm.call?.bind(llm),
    generate: llm.generate?.bind(llm),
  };
  
  // Add retry logic to key methods
  if (original.invoke) {
    llm.invoke = async (...args) => withRetry(() => original.invoke(...args), options);
  }
  
  if (original.call) {
    llm.call = async (...args) => withRetry(() => original.call(...args), options);
  }
  
  if (original.generate) {
    llm.generate = async (...args) => withRetry(() => original.generate(...args), options);
  }
  
  return llm;
}

/**
 * Check if error is a network or connectivity issue
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it's a network error
 */
export function isNetworkError(error) {
  const message = error.message.toLowerCase();
  return (
    message.includes('network') || 
    message.includes('econnrefused') || 
    message.includes('econnreset') ||
    message.includes('timeout') ||
    message.includes('unavailable') ||
    message.includes('socket') ||
    message.includes('enotfound') ||
    message.includes('dns')
  );
}
