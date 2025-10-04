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
    const headers = {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
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
      return res.status(response.status).json({ 
        error: 'Error from OpenRouter API', 
        details: errorData 
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