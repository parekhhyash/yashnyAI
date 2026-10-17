// llm.js - single LLM gateway (OpenRouter). All model calls go through here so the
// API key stays server-side and models can be swapped / failed over via env config.

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Primary model first; OpenRouter automatically falls back to the next ones on
// errors / rate limits / downtime. Override with OPENROUTER_MODEL (comma-separated).
const DEFAULT_MODELS = ['meta-llama/llama-3.3-70b-instruct', 'openai/gpt-4o-mini'];

const getModels = () => {
  const fromEnv = (process.env.OPENROUTER_MODEL || '').split(',').map(m => m.trim()).filter(Boolean);
  return fromEnv.length ? fromEnv : DEFAULT_MODELS;
};

export async function chatCompletion({ messages, maxTokens = 1000, temperature = 0.7, json = false }) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not set');

  const models = getModels();
  const body = {
    messages,
    max_tokens: maxTokens,
    temperature,
    ...(models.length > 1 ? { models } : { model: models[0] }),
    ...(json ? { response_format: { type: 'json_object' } } : {})
  };

  const resp = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': process.env.APP_URL || 'https://nyai.app',
      'X-Title': 'nyAI'
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenRouter ${resp.status}: ${errText.slice(0, 300)}`);
  }

  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter returned an empty response');
  return { text, model: data.model, usage: data.usage };
}

// Pull a JSON object out of an LLM reply (handles ```json fences and stray prose).
export function parseJSONLoose(raw) {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  try { return JSON.parse(cleaned); } catch { /* fall through */ }
  const start = cleaned.indexOf('{'), end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
  throw new Error('No JSON found in model output');
}
