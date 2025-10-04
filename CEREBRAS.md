import Cerebras from '@cerebras/cerebras_cloud_sdk';

const cerebras = new Cerebras({
  apiKey: process.env['CEREBRAS_API_KEY']
  // This is the default and can be omitted
});

async function main() {
  const stream = await cerebras.chat.completions.create({
    messages: [
        {
            "role": "system",
            "content": ""
        }
    ],
    model: 'llama-4-maverick-17b-128e-instruct',
    stream: true,
    max_completion_tokens: 32768,
    temperature: 0.6,
    top_p: 0.9
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}

main();