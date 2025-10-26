import Cerebras from '@cerebras/cerebras_cloud_sdk/index.mjs';
import { z } from 'zod';
import Bottleneck from 'bottleneck';

const MODELS = {
  HEAVY: 'llama-3.3-70b',
  LIGHT: 'llama-3-8b'
};

class CerebrasClient {
  constructor() {
    if (!process.env.CEREBRAS_API_KEY) {
      throw new Error('CEREBRAS_API_KEY required');
    }
    this.client = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY });
    this.metrics = { calls: 0, tokens: 0, errors: 0 };
    
    // Rate limiter: 30 requests per minute by default
    const rateLimit = parseInt(process.env.CEREBRAS_RATE_LIMIT || '30');
    this.limiter = new Bottleneck({
      minTime: Math.ceil(60000 / rateLimit),
      maxConcurrent: 1
    });
    
    console.log(`[CerebrasClient] Rate limit: ${rateLimit} req/min`);
  }

  async jsonResponse(schema, { systemPrompt, userPrompt, model = 'HEAVY', maxRetries = 2 }) {
    const modelName = MODELS[model] || MODELS.HEAVY;
    let attempt = 0;
    let lastError = null;

    while (attempt <= maxRetries) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt + '\n\nCRITICAL: Return ONLY valid JSON. No markdown, no explanations.' },
          { role: 'user', content: userPrompt }
        ];

        console.log(`[Cerebras] ${modelName} attempt ${attempt + 1}/${maxRetries + 1}`);
        const startTime = Date.now();

        const response = await this.limiter.schedule(() =>
          this.client.chat.completions.create({
            model: modelName,
            messages,
            temperature: model === 'HEAVY' ? 0.3 : 0.5,
            max_completion_tokens: model === 'HEAVY' ? 8192 : 4096
          })
        );

        this.metrics.calls++;
        const tokensUsed = response.usage?.total_tokens || 0;
        this.metrics.tokens += tokensUsed;

        const content = response.choices[0]?.message?.content || '';
        const latency = Date.now() - startTime;
        console.log(`[Cerebras] Completed in ${latency}ms, tokens: ${tokensUsed}`);

        // Extract JSON if wrapped in markdown
        let jsonStr = content.trim();
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) jsonStr = jsonMatch[1].trim();

        // Parse and validate
        const parsed = JSON.parse(jsonStr);
        const validated = schema.parse(parsed);

        console.log(`[Cerebras] ✅ Valid JSON on attempt ${attempt + 1}`);
        return { success: true, data: validated, attempts: attempt + 1 };

      } catch (error) {
        lastError = error;
        attempt++;

        if (error instanceof z.ZodError) {
          console.warn(`[Cerebras] Validation failed, attempt ${attempt}:`, error.errors);
          
          // On validation error, retry with the error message
          if (attempt <= maxRetries) {
            const errorMsg = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
            systemPrompt += `\n\nPREVIOUS ATTEMPT HAD ERRORS: ${errorMsg}\nFix these validation errors and return corrected JSON.`;
          }
        } else {
          console.error(`[Cerebras] Error attempt ${attempt}:`, error.message);
          this.metrics.errors++;
        }

        if (attempt > maxRetries) {
          console.error(`[Cerebras] ❌ Max retries reached`);
          return {
            success: false,
            error: lastError instanceof z.ZodError ? 'Validation failed' : error.message,
            validationErrors: lastError instanceof z.ZodError ? lastError.errors : null,
            attempts: attempt
          };
        }

        await new Promise(r => setTimeout(r, 1000 * attempt)); // Backoff
      }
    }
  }

  async streamCompletion({ systemPrompt, userPrompt, onToken, model = 'HEAVY' }) {
    const modelName = MODELS[model] || MODELS.HEAVY;
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const stream = await this.client.chat.completions.create({
      model: modelName,
      messages,
      temperature: 0.5,
      max_completion_tokens: 4096,
      stream: true
    });

    let fullText = '';
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        fullText += token;
        if (onToken) onToken(token);
      }
    }

    return fullText;
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

export default new CerebrasClient();
