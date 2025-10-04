const url = "https://openrouter.ai/api/v1/chat/completions";
const headers = {
  "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "Content-Type": "application/json"
};
const payload = {
  "messages": [
    {
      "role": "user",
      "content": "If you built the world's tallest skyscraper, what would you name it?"
    }
  ]
};

const response = await fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify(payload)
});

const data = await response.json();
console.log(data);