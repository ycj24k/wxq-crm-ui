import { request } from 'umi';

const chatGPT = (prompt: string) => {
  if (prompt) return;
  const api_key = 'YOUR_API_KEY';
  // const prompt = 'Hello, ChatGPT!';

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${api_key}`,
  };

  const data = {
    model: 'GPT-3',
    prompt: prompt,
    temperature: 0.5,
    max_tokens: 60,
  };
  request('https://api.openai.com/v1/engines/davinci-codex/completions', {
    method: 'POST',
    data: data,
    headers: headers,
  });
};

export default chatGPT;
