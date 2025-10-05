/**
 * Cerebras constants
 * Defines constants for use with the Cerebras service
 */

// Task complexity categories
export const TASK_COMPLEXITY = {
  LIGHT: 'light',   // Simple tasks, can use smaller models or local inference
  MEDIUM: 'medium', // Moderate complexity, use mid-sized models
  HEAVY: 'heavy'    // Complex reasoning, use largest models available
};

// Available Llama models on Cerebras platform
export const LLAMA_MODELS = {
  LLAMA_3_8B: 'meta-llama/llama-3-8b-instruct',
  LLAMA_3_70B: 'meta-llama/llama-3-70b-instruct',
  LLAMA_2_7B: 'meta-llama/llama-2-7b-chat',
  LLAMA_2_13B: 'meta-llama/llama-2-13b-chat',
  LLAMA_2_70B: 'meta-llama/llama-2-70b-chat',
  LLAMA_4_MAVERICK: 'llama-4-maverick-17b-128e-instruct'
};
