import fetch from 'node-fetch';

/**
 * Handle chat completions through OpenRouter API
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getChatCompletion = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const url = "https://openrouter.ai/api/v1/chat/completions";
    
    // Debug log for API key
    console.log('OpenRouter API Key (first 10 chars):', process.env.OPENROUTER_API_KEY?.substring(0, 10) || 'NOT FOUND');
    
    const headers = {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173", // Required by OpenRouter
      "X-Title": "IdeaHub Chatbot" // Optional but recommended
    };
    
    const payload = {
      "model": "anthropic/claude-3-haiku", // You can change the model as needed
      "messages": messages
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', response.status, errorData);
      console.error('Request headers:', headers);
      console.error('Request payload:', payload);
      return res.status(response.status).json({ 
        error: 'Error from OpenRouter API', 
        details: errorData,
        status: response.status,
        statusText: response.statusText
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error in chatCompletion:', error);
    res.status(500).json({ error: 'Failed to process chat completion' });
  }
};

export default {
  getChatCompletion
};